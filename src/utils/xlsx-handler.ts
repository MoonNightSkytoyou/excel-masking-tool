/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { CellModel, ColumnConfig, SheetData, MaskingConfig, EntityType, Operator } from '../types';
import { detectCellType, detectTypeFromHeader } from './detector';
import { maskCell } from './masker';

const DEFAULT_GLOBAL_OPERATORS: Record<EntityType, Operator> = {
  NAME: 'PSEUDO',
  PHONE: 'MASK',
  EMAIL: 'REDACT',
  ADDRESS: 'PSEUDO',
  DATE: 'JITTER',
  CREDIT_CARD: 'MASK',
  SENSITIVE_NUMERIC: 'INDEX',
  AMOUNT: 'BINNING',
  FORMULA_BASE: 'SCALE',
  COMPANY: 'MASK',
};

function getDefaultOperatorForType(type: EntityType | undefined): Operator {
  if (!type) return 'NONE';
  return DEFAULT_GLOBAL_OPERATORS[type] || 'PSEUDO';
}

/**
 * Utility to convert column index to letter (0 -> A, 25 -> Z, 26 -> AA)
 */
export function colIndexToLabel(col: number): string {
  let label = '';
  let temp = col + 1; // Convert to 1-based
  while (temp > 0) {
    temp--;
    label = String.fromCharCode((temp % 26) + 65) + label;
    temp = Math.floor(temp / 26);
  }
  return label;
}

/**
 * Parse an Excel file into core data structures.
 */
export async function parseExcelFile(file: File): Promise<SheetData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Could not read file data');
        }

        const workbook = XLSX.read(data, {
          type: 'array',
          cellFormula: true,
          cellHTML: false,
          cellText: true,
          cellDates: true,
        });

        const sheetsData: SheetData[] = [];

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
          
          const maxRow = range.e.r;
          const maxCol = range.e.c;

          // Determine column headers from row 0 if possible
          const columns: ColumnConfig[] = [];
          for (let c = 0; c <= maxCol; c++) {
            const headerAddress = XLSX.utils.encode_cell({ r: 0, c });
            const headerCell = sheet[headerAddress];
            const headerName = headerCell ? String(headerCell.w || headerCell.v || '').trim() : '';
            const detectedHeaderType = detectTypeFromHeader(headerName);

            columns.push({
              colIndex: c,
              addressLetter: colIndexToLabel(c),
              headerName: headerName || `Column ${colIndexToLabel(c)}`,
              detectedType: detectedHeaderType,
              selectedType: detectedHeaderType || 'NONE',
              selectedOperator: detectedHeaderType ? getDefaultOperatorForType(detectedHeaderType) : 'NONE',
            });
          }

          const cells: CellModel[] = [];

          for (let r = 0; r <= maxRow; r++) {
            for (let c = 0; c <= maxCol; c++) {
              const address = XLSX.utils.encode_cell({ r, c });
              const cell = sheet[address];
              if (!cell) continue;

              const original = String(cell.w !== undefined ? cell.w : (cell.v !== undefined ? cell.v : '')).trim();
              const formula = cell.f;
              
              let type: CellModel['type'] = 'other';
              if (formula) {
                type = 'formula';
              } else if (cell.t === 'n') {
                type = 'number';
              } else if (cell.t === 'd' || cell.v instanceof Date) {
                type = 'date';
              } else if (cell.t === 's') {
                type = 'text';
              }

              // Auto-detect cell type based on heuristics
              const detectedCellType = detectCellType(original);

              cells.push({
                sheet: sheetName,
                row: r,
                col: c,
                address,
                original,
                originalValue: cell.v,
                formula,
                type,
                detectedType: detectedCellType,
              });

              // If a column doesn't have an auto-detected type yet, let's backfill if cells contain strong matches
              if (r > 0 && detectedCellType && !columns[c].detectedType) {
                columns[c].detectedType = detectedCellType;
                columns[c].selectedType = detectedCellType;
                columns[c].selectedOperator = getDefaultOperatorForType(detectedCellType);
              }
            }
          }

          sheetsData.push({
            name: sheetName,
            cells,
            columns,
            rowCount: maxRow + 1,
            colCount: maxCol + 1,
          });
        }

        resolve(sheetsData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Perform the actual masking process on cell structures and export to an .xlsx file download.
 */
export function exportMaskedExcel(
  sheets: SheetData[],
  config: MaskingConfig,
  originalFileName: string
): void {
  const newWorkbook = XLSX.utils.book_new();

  for (const sheetData of sheets) {
    const newSheet: XLSX.WorkSheet = {};
    let minR = 0, minC = 0, maxR = 0, maxC = 0;

    // Build cells map and apply overrides
    const colConfigs = config.columnOverrides[sheetData.name] || {};

    for (const cell of sheetData.cells) {
      const colConfig = colConfigs[cell.col] || {
        selectedType: sheetData.columns[cell.col]?.selectedType || 'NONE',
        selectedOperator: sheetData.columns[cell.col]?.selectedOperator || 'NONE',
      };

      // Header row preservation: Never mask row 0 (headers)
      let finalValue = cell.original;
      let appliedOperator = colConfig.selectedOperator;
      
      if (cell.row > 0) {
        if (colConfig.selectedType !== 'NONE') {
          // Determine operator: if column operator is PSEUDO, redact, etc., apply it
          appliedOperator = colConfig.selectedOperator;
        } else {
          // If column is 'NONE', look up global operator for this specific cell's detected type
          const detected = cell.detectedType;
          if (detected) {
            appliedOperator = config.globalOperators[detected] || 'NONE';
          } else {
            appliedOperator = 'NONE';
          }
        }

        finalValue = maskCell(
          cell,
          appliedOperator,
          colConfig.selectedType !== 'NONE' ? colConfig.selectedType : cell.detectedType,
          config.locale,
          config.numericJitterPercent,
          config.dateJitterDays,
          config.hashSalt,
          sheetData.cells,
          config.formulaBaseKValues,
          config.formulaBaseIndexPercent,
          config.binningLevels
        );
      }

      // Convert back to appropriate SheetJS types
      const cellObj: XLSX.CellObject = {
        v: cell.type === 'number' && !isNaN(Number(finalValue)) ? Number(finalValue) : finalValue,
        t: cell.type === 'number' && !isNaN(Number(finalValue)) ? 'n' : 's',
      };

      if (cell.formula) {
        cellObj.f = cell.formula;
        // Keep calculated text placeholder or clear v so Excel forces evaluation on launch
        cellObj.v = undefined; 
      }

      newSheet[cell.address] = cellObj;

      // Update ranges
      minR = Math.min(minR, cell.row);
      minC = Math.min(minC, cell.col);
      maxR = Math.max(maxR, cell.row);
      maxC = Math.max(maxC, cell.col);
    }

    newSheet['!ref'] = XLSX.utils.encode_range({
      s: { r: minR, c: minC },
      e: { r: maxR, c: maxC },
    });

    XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetData.name);
  }

  // Write and trigger download
  const isCsv = originalFileName.toLowerCase().endsWith('.csv');
  let dataBlob: Blob;
  let maskedName = '';

  if (isCsv) {
    const csvContent = XLSX.write(newWorkbook, { bookType: 'csv', type: 'string' });
    dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    maskedName = `${originalFileName.substring(0, originalFileName.length - 4)}_masked.csv`;
  } else if (originalFileName.toLowerCase().endsWith('.xlsx')) {
    const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
    dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    maskedName = `${originalFileName.substring(0, originalFileName.length - 5)}_masked.xlsx`;
  } else if (originalFileName.toLowerCase().endsWith('.xls')) {
    const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xls', type: 'array' });
    dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    maskedName = `${originalFileName.substring(0, originalFileName.length - 4)}_masked.xls`;
  } else {
    const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
    dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    maskedName = `${originalFileName}_masked.xlsx`;
  }

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(dataBlob);
  downloadLink.download = maskedName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
