/**
 * Mailchimp Apply Where Condition
 *
 * Hybrid filtering: extracts server-side filters for API query params
 * and evaluates remaining conditions client-side.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';

/**
 * Server-side filterable fields in Mailchimp's GET /lists/{id}/members endpoint
 */
const SERVER_FILTERABLE_FIELDS = new Set([
  'status',
  'email_type',
  'unique_email_id',
  'vip',
]);

/**
 * Server-side filter params extracted from WHERE condition
 */
export interface MailchimpServerFilters {
  status?: string;
  email_type?: string;
  unique_email_id?: string;
  vip_only?: boolean;
  since_last_changed?: string;
  before_last_changed?: string;
}

/**
 * Extract server-side filterable conditions from WHERE clause.
 * Returns server filters and a residual WHERE for client-side evaluation.
 */
export const extractServerFilters = (
  where?: TQoreSearchRecordsWhereConditions
): { serverFilters: MailchimpServerFilters; clientWhere?: TQoreSearchRecordsWhereConditions } => {
  if (!where) {
    return { serverFilters: {} };
  }

  const serverFilters: MailchimpServerFilters = {};
  const clientConditions: TQoreSearchRecordsWhereConditions[] = [];

  const processCondition = (cond: TQoreSearchRecordsWhereConditions): void => {
    const exp = cond.exp;
    const args = cond.args || [];

    // Handle top-level AND: process each sub-condition
    if (exp === '&&') {
      for (const arg of args) {
        if (typeof arg === 'object' && 'exp' in arg) {
          processCondition(arg as TQoreSearchRecordsWhereConditions);
        }
      }
      return;
    }

    // For OR, we can't split — send entire condition to client-side
    if (exp === '||') {
      clientConditions.push(cond);
      return;
    }

    // Extract field and value from comparison
    const fieldArg = args.find(
      (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
    );
    const valueArg = args.find(
      (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
    );

    if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
      clientConditions.push(cond);
      return;
    }

    const field = fieldArg.field as string;
    const value = valueArg && typeof valueArg === 'object' && 'value' in valueArg
      ? valueArg.value
      : undefined;

    // Check if this is a server-side filterable condition
    if (exp === '==' && SERVER_FILTERABLE_FIELDS.has(field)) {
      if (field === 'status') {
        serverFilters.status = String(value);
      } else if (field === 'email_type') {
        serverFilters.email_type = String(value);
      } else if (field === 'unique_email_id') {
        serverFilters.unique_email_id = String(value);
      } else if (field === 'vip') {
        serverFilters.vip_only = value === true || value === 'true';
      }
      return;
    }

    // Handle date filtering for last_changed
    if (field === 'last_changed') {
      if (exp === '>' || exp === '>=') {
        serverFilters.since_last_changed = String(value);
        return;
      }
      if (exp === '<' || exp === '<=') {
        serverFilters.before_last_changed = String(value);
        return;
      }
    }

    // Everything else goes to client-side
    clientConditions.push(cond);
  };

  processCondition(where);

  // Reconstruct client WHERE from remaining conditions
  let clientWhere: TQoreSearchRecordsWhereConditions | undefined;
  if (clientConditions.length === 1) {
    clientWhere = clientConditions[0];
  } else if (clientConditions.length > 1) {
    clientWhere = { exp: '&&', args: clientConditions };
  }

  return { serverFilters, clientWhere };
};

/**
 * Convert server filters to Mailchimp API query params
 */
export const serverFiltersToParams = (filters: MailchimpServerFilters): Record<string, string> => {
  const params: Record<string, string> = {};

  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.email_type) {
    params.email_type = filters.email_type;
  }
  if (filters.unique_email_id) {
    params.unique_email_id = filters.unique_email_id;
  }
  if (filters.vip_only !== undefined) {
    params.vip_only = String(filters.vip_only);
  }
  if (filters.since_last_changed) {
    params.since_last_changed = filters.since_last_changed;
  }
  if (filters.before_last_changed) {
    params.before_last_changed = filters.before_last_changed;
  }

  return params;
};

// --- Client-side filtering (same pattern as Trello) ---

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
    : typeof compareValue === 'string' && !isNaN(Date.parse(compareValue as string))
      ? new Date(compareValue as string).getTime()
      : Number(compareValue);

  if (isNaN(numFieldValue) || isNaN(numCompareValue)) {
    const strFieldValue = String(fieldValue);
    const strCompareValue = String(compareValue);

    switch (operator) {
      case '>': return strFieldValue > strCompareValue;
      case '>=': return strFieldValue >= strCompareValue;
      case '<': return strFieldValue < strCompareValue;
      case '<=': return strFieldValue <= strCompareValue;
      default: return false;
    }
  }

  switch (operator) {
    case '>': return numFieldValue > numCompareValue;
    case '>=': return numFieldValue >= numCompareValue;
    case '<': return numFieldValue < numCompareValue;
    case '<=': return numFieldValue <= numCompareValue;
    default: return false;
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

  const fieldArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
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

    if (aValue === null || aValue === undefined) {
      return multiplier;
    }
    if (bValue === null || bValue === undefined) {
      return -multiplier;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return (aDate.getTime() - bDate.getTime()) * multiplier;
      }
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    return String(aValue).localeCompare(String(bValue)) * multiplier;
  });
};
