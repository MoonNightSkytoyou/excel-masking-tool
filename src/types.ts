/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EntityType = 'NAME' | 'PHONE' | 'EMAIL' | 'ADDRESS' | 'DATE' | 'CREDIT_CARD' | 'SENSITIVE_NUMERIC' | 'AMOUNT' | 'FORMULA_BASE' | 'COMPANY';

export type Operator = 'PSEUDO' | 'MASK' | 'REDACT' | 'HASH' | 'JITTER' | 'BINNING' | 'INDEX' | 'SCALE' | 'NONE';

export interface CellModel {
  sheet: string;
  row: number; // 0-indexed row
  col: number; // 0-indexed col
  address: string; // e.g., "A1"
  original: string;
  originalValue: any; // Raw parsed value
  formula?: string; // Excel formula cell.f
  type: 'text' | 'number' | 'date' | 'formula' | 'other';
  detectedType?: EntityType;
  masked?: string;
  isChanged?: boolean;
}

export interface ColumnConfig {
  colIndex: number; // 0-indexed
  addressLetter: string; // e.g., "A"
  headerName: string; // First row value, e.g., "Name"
  detectedType?: EntityType;
  selectedType: EntityType | 'NONE';
  selectedOperator: Operator;
}

export interface SheetData {
  name: string;
  cells: CellModel[];
  columns: ColumnConfig[];
  rowCount: number;
  colCount: number;
}

export interface MaskingConfig {
  globalOperators: Record<EntityType, Operator>;
  columnOverrides: Record<string, Record<number, { selectedType: EntityType | 'NONE'; selectedOperator: Operator }>>; // sheetName -> colIndex -> config
  numericJitterPercent: number; // e.g., 10 for ±10%
  dateJitterDays: number; // e.g., 5 for ±5 days
  hashSalt: string;
  locale: 'zh_CN' | 'zh_TW' | 'en' | 'zh_HK';
  formulaBaseKValues?: Record<string, number>; // key: e.g. "sheetName_colIndex" -> value of k
  formulaBaseIndexPercent?: Record<string, number>; // key: e.g. "sheetName_colIndex" -> customized target percent scale (defaults to 100)
  binningLevels?: Record<string, number>; // key: e.g. "sheetName_colIndex" -> number of levels (defaults to 5)
}

export interface SessionContext {
  sessionId: string;
  fileName: string;
  fileSize: number;
  sheets: SheetData[];
  currentSheetIndex: number;
  config: MaskingConfig;
  state: 'IDLE' | 'PARSED' | 'MASKED' | 'DOWNLOADING';
}
