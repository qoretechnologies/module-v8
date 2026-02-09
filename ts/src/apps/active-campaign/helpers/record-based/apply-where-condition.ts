/**
 * ActiveCampaign Apply Where Condition
 *
 * Hybrid filtering: extracts server-side API parameters where possible,
 * and falls back to client-side evaluation for unsupported operators.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { ENTITY_CONFIG, TActiveCampaignRecordType } from './constants';

/**
 * Result of extracting server-side parameters from WHERE conditions
 */
export interface TServerSideExtraction {
  serverParams: Record<string, string>;
  remainingWhere: TQoreSearchRecordsWhereConditions | null;
}

/**
 * Extract server-side API parameters from WHERE conditions.
 * Only Contact entity has meaningful server-side filters.
 * Returns the remaining conditions that must be evaluated client-side.
 */
export const extractServerSideParams = (
  where: TQoreSearchRecordsWhereConditions | undefined,
  entityType: TActiveCampaignRecordType
): TServerSideExtraction => {
  if (!where) {
    return { serverParams: {}, remainingWhere: null };
  }

  const serverParams: Record<string, string> = {};
  const remainingConditions: TQoreSearchRecordsWhereConditions[] = [];

  const processCondition = (condition: TQoreSearchRecordsWhereConditions): boolean => {
    const { exp, args } = condition;

    // Only process simple comparison operators for server-side
    if (exp === '&&') {
      // Process each AND sub-condition independently
      const subRemaining: TQoreSearchRecordsWhereConditions[] = [];

      for (const arg of args || []) {
        if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
          const handled = processCondition(arg as TQoreSearchRecordsWhereConditions);
          if (!handled) {
            subRemaining.push(arg as TQoreSearchRecordsWhereConditions);
          }
        }
      }

      if (subRemaining.length > 0) {
        remainingConditions.push(...subRemaining);
      }
      return true; // The && itself is handled by decomposition
    }

    // For Contact entity, try to map specific field+operator combos to API params
    if (entityType === 'Contacts') {
      const fieldArg = (args || []).find(
        (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
      );
      const valueArg = (args || []).find(
        (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
      );

      if (fieldArg && typeof fieldArg === 'object' && 'field' in fieldArg) {
        const field = fieldArg.field as string;
        const value =
          valueArg && typeof valueArg === 'object' && 'value' in valueArg
            ? String(valueArg.value)
            : undefined;

        if (value !== undefined) {
          // email == "x" -> API param: email=x
          if (field === 'email' && exp === '==') {
            serverParams.email = value;
            return true;
          }
          // email contains "x" -> API param: email_like=x
          if (field === 'email' && exp === 'contains') {
            serverParams.email_like = value;
            return true;
          }
          // phone == "x" -> API param: phone=x
          if (field === 'phone' && exp === '==') {
            serverParams.phone = value;
            return true;
          }
          // status == "x" -> API param: status=x
          if (field === 'status' && exp === '==') {
            serverParams.status = value;
            return true;
          }
          // listid == "x" -> API param: listid=x
          if (field === 'listid' && exp === '==') {
            serverParams.listid = value;
            return true;
          }
        }
      }
    }

    // For all entities, use 'search' param for text contains on key fields
    if (exp === 'contains') {
      const fieldArg = (args || []).find(
        (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
      );
      const valueArg = (args || []).find(
        (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
      );

      if (fieldArg && typeof fieldArg === 'object' && 'field' in fieldArg) {
        const field = fieldArg.field as string;
        const value =
          valueArg && typeof valueArg === 'object' && 'value' in valueArg
            ? String(valueArg.value)
            : undefined;

        // Use 'search' param for name-like fields when not already handled above
        const searchableFields =
          entityType === 'Contacts'
            ? ['firstName', 'lastName']
            : entityType === 'Deals'
              ? ['title']
              : ['name'];

        if (value !== undefined && searchableFields.includes(field) && !serverParams.search) {
          serverParams.search = value;
          return true;
        }
      }
    }

    return false;
  };

  processCondition(where);

  // Build remaining WHERE from unhandled conditions
  let remainingWhere: TQoreSearchRecordsWhereConditions | null = null;

  if (remainingConditions.length === 1) {
    remainingWhere = remainingConditions[0];
  } else if (remainingConditions.length > 1) {
    remainingWhere = {
      exp: '&&',
      args: remainingConditions,
    };
  }

  // If the original was not && and wasn't handled, keep it all client-side
  if (where.exp !== '&&' && Object.keys(serverParams).length === 0) {
    remainingWhere = where;
  }

  return { serverParams, remainingWhere };
};

/**
 * Evaluate a single comparison expression against a record value
 */
const evaluateComparison = (
  fieldValue: unknown,
  operator: string,
  compareValue: unknown
): boolean => {
  if (operator === 'is-set') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }

  if (operator === 'is-not-set') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }

  if (fieldValue === null || fieldValue === undefined) {
    return operator === '!=' && compareValue !== null && compareValue !== undefined;
  }

  if (operator === 'contains') {
    if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
      return fieldValue.toLowerCase().includes(compareValue.toLowerCase());
    }
    return false;
  }

  if (operator === '==') {
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
    ? (compareValue as Date).getTime()
    : typeof compareValue === 'string' && !isNaN(Date.parse(compareValue))
      ? new Date(compareValue).getTime()
      : Number(compareValue);

  if (isNaN(numFieldValue) || isNaN(numCompareValue)) {
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
 * Evaluate a WHERE condition tree against a single record
 */
const evaluateCondition = (
  record: Record<string, unknown>,
  where: TQoreSearchRecordsWhereConditions
): boolean => {
  const { exp, args } = where;

  if (exp === '&&') {
    return (args || []).every((arg) => {
      if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
        return evaluateCondition(record, arg as TQoreSearchRecordsWhereConditions);
      }
      return true;
    });
  }

  if (exp === '||') {
    return (args || []).some((arg) => {
      if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
        return evaluateCondition(record, arg as TQoreSearchRecordsWhereConditions);
      }
      return false;
    });
  }

  const fieldArg = (args || []).find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = (args || []).find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return true;
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
  where?: TQoreSearchRecordsWhereConditions | null
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

/**
 * Check if a sort field can be handled server-side for a given entity
 */
export const canSortServerSide = (
  entityType: TActiveCampaignRecordType,
  field?: string
): boolean => {
  if (!field) {
    return false;
  }
  return ENTITY_CONFIG[entityType].sortableFields.includes(field);
};
