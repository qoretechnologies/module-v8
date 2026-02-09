/**
 * QuickBooks Apply Where Condition
 *
 * Converts Qore WHERE expressions to QuickBooks CriteriaItem arrays for server-side
 * filtering, with a client-side fallback for unsupported operators (||, !=, is-set, is-not-set).
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { CriteriaItem } from 'quickbooks-node-promise';

/**
 * Result of converting WHERE conditions.
 * - `criteria`: Server-side CriteriaItem array for QB find methods
 * - `clientSideFilter`: Unsupported conditions to evaluate in memory after fetching
 */
export interface WhereConversionResult {
  criteria: CriteriaItem[];
  clientSideFilter?: TQoreSearchRecordsWhereConditions;
}

/**
 * Convert Qore WHERE conditions to QuickBooks CriteriaItem array + optional client-side filter.
 */
export const buildQuickbooksCriteria = (
  where: TQoreSearchRecordsWhereConditions | undefined
): WhereConversionResult => {
  if (!where) {
    return { criteria: [] };
  }

  const criteria: CriteriaItem[] = [];
  const clientSideConditions: TQoreSearchRecordsWhereConditions[] = [];

  processCondition(where, criteria, clientSideConditions);

  return {
    criteria,
    clientSideFilter:
      clientSideConditions.length > 0 ? combineConditions(clientSideConditions) : undefined,
  };
};

/**
 * Recursively process a WHERE condition node.
 */
const processCondition = (
  condition: TQoreSearchRecordsWhereConditions,
  criteria: CriteriaItem[],
  clientSide: TQoreSearchRecordsWhereConditions[]
): void => {
  const { exp, args } = condition;

  if (!exp || !args) {
    return;
  }

  // AND: recurse into children — all child criteria are implicitly ANDed
  if (exp === '&&') {
    for (const arg of args) {
      if (isWhereCondition(arg)) {
        processCondition(arg, criteria, clientSide);
      }
    }
    return;
  }

  // OR: not supported by QB — push entire subtree to client-side
  if (exp === '||') {
    clientSide.push(condition);
    return;
  }

  // Comparison operators
  const fieldArg = args.find(
    (a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
    (a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return;
  }

  const field = fieldArg.field as string;
  const value =
    valueArg && typeof valueArg === 'object' && 'value' in valueArg ? valueArg.value : undefined;

  // != is not supported by QB — push to client-side
  if (exp === '!=') {
    clientSide.push(condition);
    return;
  }

  // is-set / is-not-set — push to client-side (QB has limited NULL support)
  if (exp === 'is-set' || exp === 'is-not-set') {
    clientSide.push(condition);
    return;
  }

  // Build CriteriaItem for supported operators
  const item = buildCriteriaItem(exp, field, value);
  if (item) {
    criteria.push(item);
  }
};

/**
 * Build a single CriteriaItem for a supported comparison operator.
 */
const buildCriteriaItem = (
  operator: string,
  field: string,
  value: unknown
): CriteriaItem | null => {
  const strValue = value === undefined || value === null ? '' : String(value);

  switch (operator) {
    case '==':
      return { field, value: strValue, operator: '=' };
    case '>':
      return { field, value: strValue, operator: '>' };
    case '>=':
      return { field, value: strValue, operator: '>=' };
    case '<':
      return { field, value: strValue, operator: '<' };
    case '<=':
      return { field, value: strValue, operator: '<=' };
    case 'contains':
      return { field, value: `%${strValue}%`, operator: 'LIKE' };
    case 'starts-with':
      return { field, value: `${strValue}%`, operator: 'LIKE' };
    default:
      return null;
  }
};

// ---- Client-side filtering ----

/**
 * Apply client-side filtering to records for operators not supported by QB.
 */
export const filterRecordsClientSide = (
  records: Record<string, unknown>[],
  where: TQoreSearchRecordsWhereConditions | undefined
): Record<string, unknown>[] => {
  if (!where) {
    return records;
  }

  return records.filter((record) => evaluateCondition(record, where));
};

/**
 * Evaluate a single condition against a record.
 */
const evaluateCondition = (
  record: Record<string, unknown>,
  condition: TQoreSearchRecordsWhereConditions
): boolean => {
  const { exp, args } = condition;

  if (!exp || !args) {
    return true;
  }

  // Logical operators
  if (exp === '&&') {
    return args.every((arg) =>
      isWhereCondition(arg) ? evaluateCondition(record, arg) : true
    );
  }

  if (exp === '||') {
    return args.some((arg) =>
      isWhereCondition(arg) ? evaluateCondition(record, arg) : true
    );
  }

  // Comparison operators
  const fieldArg = args.find(
    (a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
    (a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return true;
  }

  const field = fieldArg.field as string;
  const fieldValue = getNestedValue(record, field);
  const compareValue =
    valueArg && typeof valueArg === 'object' && 'value' in valueArg ? valueArg.value : undefined;

  return evaluateComparison(exp, fieldValue, compareValue);
};

/**
 * Evaluate a comparison between a field value and a target value.
 */
const evaluateComparison = (operator: string, fieldValue: unknown, compareValue: unknown): boolean => {
  switch (operator) {
    case '==':
      return String(fieldValue) === String(compareValue);
    case '!=':
      return String(fieldValue) !== String(compareValue);
    case '>':
      return Number(fieldValue) > Number(compareValue);
    case '>=':
      return Number(fieldValue) >= Number(compareValue);
    case '<':
      return Number(fieldValue) < Number(compareValue);
    case '<=':
      return Number(fieldValue) <= Number(compareValue);
    case 'contains':
      return (
        typeof fieldValue === 'string' &&
        typeof compareValue === 'string' &&
        fieldValue.toLowerCase().includes(compareValue.toLowerCase())
      );
    case 'starts-with':
      return (
        typeof fieldValue === 'string' &&
        typeof compareValue === 'string' &&
        fieldValue.toLowerCase().startsWith(compareValue.toLowerCase())
      );
    case 'is-set':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    case 'is-not-set':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';
    default:
      return true;
  }
};

// ---- Utilities ----

/**
 * Get a nested value from an object using dot notation (e.g., 'MetaData.CreateTime').
 */
export const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
};

/**
 * Type guard for WHERE condition objects.
 */
const isWhereCondition = (arg: unknown): arg is TQoreSearchRecordsWhereConditions => {
  return typeof arg === 'object' && arg !== null && 'exp' in arg;
};

/**
 * Combine multiple conditions with AND logic.
 */
const combineConditions = (
  conditions: TQoreSearchRecordsWhereConditions[]
): TQoreSearchRecordsWhereConditions => {
  if (conditions.length === 1) {
    return conditions[0];
  }

  return {
    exp: '&&',
    args: conditions,
  };
};
