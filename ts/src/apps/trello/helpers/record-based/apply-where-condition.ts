/**
 * Trello Apply Where Condition
 *
 * Client-side filtering of card records using Qore WHERE conditions.
 * Since Trello API lacks server-side filtering, all filtering is done in memory.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';

/**
 * Evaluate a single comparison expression against a record
 */
const evaluateComparison = (
  fieldValue: unknown,
  operator: string,
  compareValue: unknown
): boolean => {
  // Handle null/undefined checks
  if (operator === 'is-set') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }

  if (operator === 'is-not-set') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }

  // For other operators, handle null values
  if (fieldValue === null || fieldValue === undefined) {
    return operator === '!=' && compareValue !== null && compareValue !== undefined;
  }

  // String contains check
  if (operator === 'contains') {
    if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
      return fieldValue.toLowerCase().includes(compareValue.toLowerCase());
    }
    return false;
  }

  // Equality checks
  if (operator === '==') {
    // Handle date comparison
    if (fieldValue instanceof Date || compareValue instanceof Date) {
      const fieldDate = fieldValue instanceof Date ? fieldValue : new Date(String(fieldValue));
      const compareDate = compareValue instanceof Date ? compareValue : new Date(String(compareValue));
      return fieldDate.getTime() === compareDate.getTime();
    }
    return fieldValue === compareValue;
  }

  if (operator === '!=') {
    if (fieldValue instanceof Date || compareValue instanceof Date) {
      const fieldDate = fieldValue instanceof Date ? fieldValue : new Date(String(fieldValue));
      const compareDate = compareValue instanceof Date ? compareValue : new Date(String(compareValue));
      return fieldDate.getTime() !== compareDate.getTime();
    }
    return fieldValue !== compareValue;
  }

  // Numeric/date comparisons
  const numFieldValue = fieldValue instanceof Date
    ? fieldValue.getTime()
    : typeof fieldValue === 'string' && !isNaN(Date.parse(fieldValue))
      ? new Date(fieldValue).getTime()
      : Number(fieldValue);

  const numCompareValue = compareValue instanceof Date
    ? compareValue.getTime()
    : typeof compareValue === 'string' && !isNaN(Date.parse(compareValue))
      ? new Date(compareValue).getTime()
      : Number(compareValue);

  if (isNaN(numFieldValue) || isNaN(numCompareValue)) {
    // Fall back to string comparison
    const strFieldValue = String(fieldValue);
    const strCompareValue = String(compareValue);

    switch (operator) {
      case '>':
        return strFieldValue > strCompareValue;
      case '>=':
        return strFieldValue >= strCompareValue;
      case '<':
        return strFieldValue < strCompareValue;
      case '<=':
        return strFieldValue <= strCompareValue;
      default:
        return false;
    }
  }

  switch (operator) {
    case '>':
      return numFieldValue > numCompareValue;
    case '>=':
      return numFieldValue >= numCompareValue;
    case '<':
      return numFieldValue < numCompareValue;
    case '<=':
      return numFieldValue <= numCompareValue;
    default:
      return false;
  }
};

/**
 * Evaluate a WHERE condition against a record
 */
const evaluateCondition = (
  record: Record<string, unknown>,
  where: TQoreSearchRecordsWhereConditions
): boolean => {
  const exp = where.exp;
  const args = where.args || [];

  // Handle logical operators
  if (exp === '&&') {
    return args.every((arg) => {
      if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
        return evaluateCondition(record, arg as TQoreSearchRecordsWhereConditions);
      }
      return true;
    });
  }

  if (exp === '||') {
    return args.some((arg) => {
      if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
        return evaluateCondition(record, arg as TQoreSearchRecordsWhereConditions);
      }
      return false;
    });
  }

  // Handle comparison operators
  const fieldArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return true; // Skip invalid conditions
  }

  const field = fieldArg.field as string;
  const fieldValue = record[field];
  const compareValue =
    valueArg && typeof valueArg === 'object' && 'value' in valueArg ? valueArg.value : undefined;

  return evaluateComparison(fieldValue, exp, compareValue);
};

/**
 * Filter records based on WHERE conditions (client-side)
 */
export const filterRecords = (
  records: Record<string, unknown>[],
  where?: TQoreSearchRecordsWhereConditions
): Record<string, unknown>[] => {
  if (!where) {
    return records;
  }

  return records.filter((record) => evaluateCondition(record, where));
};

/**
 * Sort records based on orderBy options
 */
export const sortRecords = (
  records: Record<string, unknown>[],
  orderBy?: { field: string; direction?: string }
): Record<string, unknown>[] => {
  if (!orderBy || !orderBy.field) {
    return records;
  }

  const { field, direction = 'asc' } = orderBy;
  const multiplier = direction === 'desc' ? -1 : 1;

  return [...records].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    // Handle null/undefined
    if (aValue === null || aValue === undefined) {
      return multiplier;
    }
    if (bValue === null || bValue === undefined) {
      return -multiplier;
    }

    // Date comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return (aDate.getTime() - bDate.getTime()) * multiplier;
      }
    }

    // Number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    // String comparison
    return String(aValue).localeCompare(String(bValue)) * multiplier;
  });
};
