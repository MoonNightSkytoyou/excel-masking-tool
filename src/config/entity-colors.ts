/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EntityType } from '../types';

export const ENTITY_COLORS: Record<EntityType, { color: string; bg: string }> = {
  NAME: { color: 'text-blue-700 border-blue-200', bg: 'bg-blue-50' },
  PHONE: { color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50' },
  EMAIL: { color: 'text-purple-700 border-purple-200', bg: 'bg-purple-50' },
  ADDRESS: { color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50' },
  DATE: { color: 'text-pink-700 border-pink-200', bg: 'bg-pink-50' },
  CREDIT_CARD: { color: 'text-rose-700 border-rose-200', bg: 'bg-rose-50' },
  SENSITIVE_NUMERIC: { color: 'text-orange-700 border-orange-200', bg: 'bg-orange-50' },
  AMOUNT: { color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50' },
  FORMULA_BASE: { color: 'text-indigo-700 border-indigo-200', bg: 'bg-indigo-50' },
  COMPANY: { color: 'text-teal-700 border-teal-200', bg: 'bg-teal-50' },
};
