/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CellModel, EntityType, Operator } from '../types';
import { generateFakeValue, sha256Hash, createPRNG } from './faker';

/**
 * Apply the selected masking operator on a CellModel.
 */
export function maskCell(
  cell: CellModel,
  operator: Operator,
  entityType: EntityType | undefined,
  locale: 'zh_CN' | 'zh_TW' | 'en' | 'zh_HK',
  jitterPercent: number, // e.g., 10 for ±10%
  jitterDays: number, // e.g., 5 for ±5 days
  salt: string = 'mask-salt',
  allSheetCells?: CellModel[],
  formulaBaseKValues?: Record<string, number>,
  formulaBaseIndexPercent?: Record<string, number>,
  binningLevels?: Record<string, number>
): string {
  const original = cell.original ? cell.original.trim() : '';
  if (!original) return '';

  const actualType = entityType || cell.detectedType;

  // If no operator is chosen, or operator is NONE, return original
  if (operator === 'NONE' || !operator) {
    return cell.original;
  }

  // Handle REDACT globally first
  if (operator === 'REDACT') {
    return '[REDACTED]';
  }

  // Handle HASH globally
  if (operator === 'HASH') {
    return sha256Hash(original + salt);
  }

  // Handle BINNING
  if (operator === 'BINNING') {
    const rawVal = Number(cell.originalValue !== undefined && cell.originalValue !== '' ? cell.originalValue : original.replace(/,/g, ''));
    if (!isNaN(rawVal)) {
      // Find the range of the current column to apply Equal Width Interval Method
      let minVal = Infinity;
      let maxVal = -Infinity;
      if (allSheetCells) {
        for (const c of allSheetCells) {
          if (c.col === cell.col && c.row > 0) {
            const val = Number(c.originalValue !== undefined && c.originalValue !== '' ? c.originalValue : c.original.replace(/,/g, ''));
            if (!isNaN(val)) {
              if (val < minVal) minVal = val;
              if (val > maxVal) maxVal = val;
            }
          }
        }
      }

      const key = `${cell.sheet}_${cell.col}`;
      const levels = (binningLevels && binningLevels[key] !== undefined) ? binningLevels[key] : 5;

      if (minVal === Infinity || maxVal === -Infinity) {
        return original;
      }

      if (minVal === maxVal) {
        return String(minVal);
      }

      const range = maxVal - minVal;
      const width = range / levels;

      let binIndex = Math.floor((rawVal - minVal) / width);
      if (binIndex >= levels) {
        binIndex = levels - 1;
      }
      if (binIndex < 0) {
        binIndex = 0;
      }

      const getFormattedBound = (v: number) => {
        if (Number.isInteger(minVal) && Number.isInteger(maxVal) && Number.isInteger(width)) {
          return String(Math.round(v));
        }
        return v.toFixed(2);
      };

      const lowerBound = minVal + binIndex * width;
      const upperBound = minVal + (binIndex + 1) * width;

      return `${getFormattedBound(lowerBound)} - ${getFormattedBound(upperBound)}`;
    }
    return original;
  }

  // Handle INDEX (Normalization)
  if (operator === 'INDEX') {
    let maxVal = -Infinity;
    if (allSheetCells) {
      for (const c of allSheetCells) {
        if (c.col === cell.col && c.row > 0) {
          const val = Number(c.originalValue !== undefined && c.originalValue !== '' ? c.originalValue : c.original.replace(/,/g, ''));
          if (!isNaN(val) && val > maxVal) {
            maxVal = val;
          }
        }
      }
    }

    const key = `${cell.sheet}_${cell.col}`;
    const p = (formulaBaseIndexPercent && formulaBaseIndexPercent[key] !== undefined) ? formulaBaseIndexPercent[key] : 100;

    if (maxVal <= 0 || !isFinite(maxVal)) {
      const currentVal = Number(cell.originalValue !== undefined && cell.originalValue !== '' ? cell.originalValue : original.replace(/,/g, ''));
      if (!isNaN(currentVal) && currentVal > 0) {
        return `${p.toFixed(2)}%`;
      }
      return original;
    }
    const currentVal = Number(cell.originalValue !== undefined && cell.originalValue !== '' ? cell.originalValue : original.replace(/,/g, ''));
    if (!isNaN(currentVal)) {
      const percentage = (currentVal / maxVal) * p;
      return `${percentage.toFixed(2)}%`;
    }
    return original;
  }

  // Handle SCALE (Secret Constant Scaling)
  if (operator === 'SCALE') {
    const rawVal = Number(cell.originalValue !== undefined && cell.originalValue !== '' ? cell.originalValue : original.replace(/,/g, ''));
    if (!isNaN(rawVal)) {
      const key = `${cell.sheet}_${cell.col}`;
      const k = (formulaBaseKValues && formulaBaseKValues[key] !== undefined) ? formulaBaseKValues[key] : 1.0;
      const finalVal = rawVal * k;

      const decimalParts = original.split('.');
      if (decimalParts.length > 1) {
        return finalVal.toFixed(decimalParts[1].length);
      }
      return String(Math.round(finalVal));
    }
    return original;
  }

  // Handle PSEUDO
  if (operator === 'PSEUDO') {
    if (actualType) {
      return generateFakeValue(original, actualType, locale, salt);
    }
    // Fallback to MASK if type unknown
    return smartMask(original, undefined);
  }

  // Handle MASK
  if (operator === 'MASK') {
    return smartMask(original, actualType);
  }

  // Handle JITTER (Numeric or Date random shift)
  if (operator === 'JITTER') {
    const rng = createPRNG(original + salt);

    // If cell is numeric or has date type
    if (cell.type === 'number' || typeof cell.originalValue === 'number') {
      const numVal = Number(cell.originalValue);
      if (!isNaN(numVal)) {
        // If it's a date serial number (typically between 15000 and 60000 in Excel)
        // Shift by days directly
        if (actualType === 'DATE' || numVal > 15000 && numVal < 60000) {
          const shift = Math.floor(rng() * (jitterDays * 2 + 1)) - jitterDays; // [-days, +days]
          const finalVal = numVal + shift;
          return String(finalVal);
        } else {
          // Standard numerical column: apply percentage jitter
          const pct = (jitterPercent / 100);
          const factor = 1 + (rng() * (pct * 2) - pct); // [1 - pct, 1 + pct]
          const finalVal = numVal * factor;
          // Format based on decimal length of original
          const decimalParts = original.split('.');
          if (decimalParts.length > 1) {
            return finalVal.toFixed(decimalParts[1].length);
          }
          return String(Math.round(finalVal));
        }
      }
    }

    // If Date is formatted as text (e.g. 2024-10-12 or 8/10/28)
    if (actualType === 'DATE') {
      const sepMatch = original.match(/[-/.]/);
      if (sepMatch) {
        const sep = sepMatch[0];
        const parts = original.split(sep);
        if (parts.length === 3) {
          const shift = Math.floor(rng() * (jitterDays * 2 + 1)) - jitterDays;
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            const dateObj = new Date(Date.UTC(y, m, d));
            if (!isNaN(dateObj.getTime())) {
              dateObj.setUTCDate(dateObj.getUTCDate() + shift);
              const ny = dateObj.getUTCFullYear();
              const nm = String(dateObj.getUTCMonth() + 1).padStart(parts[1].length, '0');
              const nd = String(dateObj.getUTCDate()).padStart(parts[2].length, '0');
              return `${ny}${sep}${nm}${sep}${nd}`;
            }
          } else if (parts[2].length === 4 || parts[2].length === 2) {
            // MM/DD/YYYY or DD/MM/YYYY format
            let y = parseInt(parts[2], 10);
            if (parts[2].length === 2) {
              y = y < 50 ? 2000 + y : 1900 + y;
            }
            const p0 = parseInt(parts[0], 10);
            const p1 = parseInt(parts[1], 10);
            const isDayFirst = (p0 > 12);
            const m = isDayFirst ? p1 - 1 : p0 - 1;
            const d = isDayFirst ? p0 : p1;
            const dateObj = new Date(Date.UTC(y, m, d));
            if (!isNaN(dateObj.getTime())) {
              dateObj.setUTCDate(dateObj.getUTCDate() + shift);
              const ny = String(dateObj.getUTCFullYear()).substring(parts[2].length === 2 ? 2 : 0);
              const nm_str = String(dateObj.getUTCMonth() + 1).padStart(isDayFirst ? parts[1].length : parts[0].length, '0');
              const nd_str = String(dateObj.getUTCDate()).padStart(isDayFirst ? parts[0].length : parts[1].length, '0');
              if (isDayFirst) {
                return `${nd_str}${sep}${nm_str}${sep}${ny}`;
              } else {
                return `${nm_str}${sep}${nd_str}${sep}${ny}`;
              }
            }
          }
        }
      }
    }

    // Fallback if not numeric or date
    return smartMask(original, actualType);
  }

  return cell.original;
}

/**
 * Smart contextual masking for standard fields.
 */
function smartMask(text: string, type: EntityType | undefined): string {
  if (!text) return '';

  switch (type) {
    case 'COMPANY': {
      const cnSuffixes = [
        '股份有限公司',
        '有限責任公司',
        '控股有限公司',
        '有限公司',
        '股份公司',
        '無限公司',
        '合夥企業',
        '工作室',
        '商號',
        '商行',
        '集團',
        '公司',
        '行'
      ];
      const enSuffixes = [
        'co., ltd.',
        'co. ltd.',
        'co ltd',
        'ltd.',
        'ltd',
        'corp.',
        'corp',
        'corporation',
        'inc.',
        'inc',
        'incorporated',
        'llc',
        'l.l.c.',
        'plc',
        'p.l.c.'
      ];

      let matchedSuffix = '';
      for (const suffix of cnSuffixes) {
        if (text.endsWith(suffix)) {
          matchedSuffix = suffix;
          break;
        }
      }

      if (!matchedSuffix) {
        const textLower = text.toLowerCase();
        for (const suffix of enSuffixes) {
          if (textLower.endsWith(suffix)) {
            matchedSuffix = text.substring(text.length - suffix.length);
            break;
          }
        }
      }

      if (matchedSuffix) {
        const prefix = text.substring(0, text.length - matchedSuffix.length);
        const maskedPrefix = '*'.repeat(prefix.length);
        return `${maskedPrefix}${matchedSuffix}`;
      }

      if (text.length <= 4) return '***';
      const visible = Math.ceil(text.length / 3);
      return `${text.substring(0, visible)}${'*'.repeat(text.length - visible)}`;
    }

    case 'EMAIL': {
      const parts = text.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        if (name.length <= 2) {
          return `${name.substring(0, 1)}*@${domain}`;
        }
        return `${name.substring(0, 1)}***${name.substring(name.length - 1)}@${domain}`;
      }
      return `${text.substring(0, 2)}***`;
    }

    case 'PHONE': {
      const digits = text.replace(/[^0-9]/g, '');
      if (digits.length > 0) {
        let startLen = 0;
        let endLen = 0;
        let maskLen = 0;

        if (digits.length >= 11) {
          startLen = 3;
          endLen = 4;
          maskLen = digits.length - startLen - endLen; // at least 4
        } else if (digits.length === 10) {
          startLen = 2;
          endLen = 4;
          maskLen = 4;
        } else if (digits.length === 9) {
          startLen = 1;
          endLen = 4;
          maskLen = 4;
        } else if (digits.length === 8) {
          startLen = 1;
          endLen = 3;
          maskLen = 4;
        } else {
          maskLen = Math.min(digits.length, 4);
          endLen = digits.length - maskLen;
          startLen = 0;
        }

        const maskStr = '*'.repeat(maskLen);
        return `${digits.substring(0, startLen)}${maskStr}${digits.substring(digits.length - endLen)}`;
      }
      if (text.length <= 4) return '****';
      return '****' + text.substring(Math.min(text.length, 4));
    }

    case 'CREDIT_CARD': {
      const clean = text.replace(/[^0-9]/g, '');
      if (clean.length >= 15) {
        // e.g., 4111 **** **** 1111
        return `${clean.substring(0, 4)} **** **** ${clean.substring(clean.length - 4)}`;
      }
      return '**** **** **** ****';
    }

    case 'DATE': {
      // Return 2024-**-** or similar
      return text.replace(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/, (m) => {
        const sep = m.includes('/') ? '/' : '-';
        const parts = m.split(sep);
        return `${parts[0]}${sep}**${sep}**`;
      });
    }

    case 'NAME': {
      // If Chinese Name (length 2-4)
      if (/^[\u4e00-\u9fa5]{2,4}$/.test(text)) {
        if (text.length === 2) {
          return `${text.charAt(0)}*`;
        }
        if (text.length === 3) {
          return `${text.charAt(0)}*${text.charAt(2)}`;
        }
        return `${text.charAt(0)}**${text.charAt(3)}`;
      }
      // If English Name
      const words = text.split(' ');
      if (words.length >= 2) {
        const first = words[0];
        const last = words[words.length - 1];
        return `${first.charAt(0)}*** ${last.charAt(0)}***`;
      }
      return `${text.substring(0, Math.ceil(text.length / 2))}***`;
    }

    case 'ADDRESS': {
      // Mask second half of address
      const half = Math.ceil(text.length / 2);
      return `${text.substring(0, half)}${'*'.repeat(text.length - half)}`;
    }

    default: {
      // General fallback
      if (text.length <= 4) return '***';
      const visible = Math.ceil(text.length / 3);
      return `${text.substring(0, visible)}${'*'.repeat(text.length - visible)}`;
    }
  }
}

/**
 * Categorize numeric value into logical intervals/bins.
 * Adapts automatically to Monthly Salary scale vs. Corporate Revenue/Large Scale scale.
 */
export function binningValue(value: number): string {
  if (isNaN(value)) return String(value);

  // If it's a large scale number (e.g., corporate revenue scale)
  if (value >= 1000000) {
    if (value < 5000000) {
      return '1M - 5M';
    } else if (value < 10000000) {
      return '5M - 10M';
    } else if (value < 50000000) {
      return '10M - 50M';
    } else if (value < 100000000) {
      return '50M - 100M';
    } else {
      return '>= 100M';
    }
  } else {
    // Standard monthly salary scale / smaller numeric bracket
    if (value < 30000) {
      return '< 30,000';
    } else if (value < 50000) {
      return '30,000 - 50,000';
    } else if (value < 70000) {
      return '50,000 - 70,000';
    } else if (value < 100000) {
      return '70,000 - 100,000';
    } else if (value < 150000) {
      return '100,000 - 150,000';
    } else if (value < 300000) {
      return '150,000 - 300,000';
    } else {
      return '>= 300,000';
    }
  }
}

/**
 * Normalize numeric values of a target field across an array of row objects
 * relative to the maximum value of that field.
 */
export function convertToValueIndex(dataArray: any[], targetField: string): any[] {
  if (!dataArray || dataArray.length === 0) return dataArray;

  // 1. Find the maximum value
  let maxVal = -Infinity;
  for (const item of dataArray) {
    const val = Number(item[targetField]);
    if (!isNaN(val) && val > maxVal) {
      maxVal = val;
    }
  }

  // If no valid numbers or max is 0, keep as is
  if (maxVal <= 0 || !isFinite(maxVal)) {
    return dataArray;
  }

  // 2. Modify each row to (value / maxVal) * 100 rounded to 2 decimal places
  return dataArray.map(item => {
    const rawVal = Number(item[targetField]);
    if (!isNaN(rawVal)) {
      const percentage = (rawVal / maxVal) * 100;
      const rounded = Math.round(percentage * 100) / 100;
      return {
        ...item,
        [targetField]: `${rounded.toFixed(2)}%`
      };
    }
    return item;
  });
}

