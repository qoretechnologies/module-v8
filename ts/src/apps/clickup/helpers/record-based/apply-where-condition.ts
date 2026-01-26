/**
 * ClickUp Apply Where Condition
 *
 * Converts Qore search conditions to ClickUp API filter parameters.
 * ClickUp uses different parameter formats for standard fields vs custom fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { EXPRESSION_TO_CLICKUP_OP } from './constants';

/**
 * Custom field filter structure for ClickUp API
 */
export interface ClickUpCustomFieldFilter {
  field_id: string;
  operator: string;
  value?: unknown;
}

/**
 * Filter parameters for ClickUp task search
 */
export interface ClickUpFilterParams {
  statuses?: string[];
  assignees?: string[];
  tags?: string[];
  priority?: number[];
  due_date_gt?: number;
  due_date_lt?: number;
  date_created_gt?: number;
  date_created_lt?: number;
  date_updated_gt?: number;
  date_updated_lt?: number;
  custom_fields?: ClickUpCustomFieldFilter[];
}

/**
 * Build ClickUp filter parameters from Qore WHERE conditions.
 *
 * @param where - Qore search conditions
 * @param customFieldMap - Map of custom field names to their IDs
 * @returns ClickUp filter parameters
 */
export const buildClickUpFilter = (
  where: TQoreSearchRecordsWhereConditions,
  customFieldMap: Map<string, string>
): ClickUpFilterParams => {
  const params: ClickUpFilterParams = {};

  const processCondition = (cond: TQoreSearchRecordsWhereConditions): void => {
    const { exp, args } = cond;

    // Handle logical operators (AND/OR)
    if (exp === '&&' || exp === '||') {
      // ClickUp primarily supports AND logic - OR is limited
      // Process all nested conditions
      args.filter(isQoreRecordSearchExpression).forEach(processCondition);
      return;
    }

    // Get field reference
    if (!isQoreRecordSearchFieldReference(args[0])) {
      return;
    }

    const fieldName = args[0].field;
    const value = (args[1] as TQoreSearchRecordsValue)?.value;
    const clickUpOp = EXPRESSION_TO_CLICKUP_OP[exp];

    // Handle standard fields with special query parameters
    switch (fieldName) {
      case 'status': {
        if (exp === '==' || exp === 'any-of') {
          params.statuses = params.statuses || [];
          if (Array.isArray(value)) {
            params.statuses.push(...(value as string[]));
          } else if (value !== undefined) {
            params.statuses.push(String(value));
          }
        }
        return;
      }

      case 'assignees': {
        if (exp === '==' || exp === 'any-of' || exp === 'all-of') {
          params.assignees = params.assignees || [];
          if (Array.isArray(value)) {
            params.assignees.push(...(value as string[]));
          } else if (value !== undefined) {
            params.assignees.push(String(value));
          }
        }
        return;
      }

      case 'tags': {
        if (exp === '==' || exp === 'any-of' || exp === 'all-of') {
          params.tags = params.tags || [];
          if (Array.isArray(value)) {
            params.tags.push(...(value as string[]));
          } else if (value !== undefined) {
            params.tags.push(String(value));
          }
        }
        return;
      }

      case 'priority': {
        if (exp === '==' || exp === 'any-of') {
          params.priority = params.priority || [];
          if (Array.isArray(value)) {
            params.priority.push(...(value as number[]));
          } else if (value !== undefined) {
            params.priority.push(Number(value));
          }
        }
        return;
      }

      case 'due_date': {
        const timestamp = convertToTimestamp(value);
        if (timestamp !== null) {
          if (exp === '>' || exp === '>=') {
            params.due_date_gt = timestamp;
          } else if (exp === '<' || exp === '<=') {
            params.due_date_lt = timestamp;
          } else if (exp === 'range' && args.length >= 3) {
            const lowValue = (args[1] as TQoreSearchRecordsValue)?.value;
            const highValue = (args[2] as TQoreSearchRecordsValue)?.value;
            const lowTimestamp = convertToTimestamp(lowValue);
            const highTimestamp = convertToTimestamp(highValue);
            if (lowTimestamp !== null) {
              params.due_date_gt = lowTimestamp;
            }
            if (highTimestamp !== null) {
              params.due_date_lt = highTimestamp;
            }
          }
        }
        return;
      }

      case 'date_created': {
        const timestamp = convertToTimestamp(value);
        if (timestamp !== null) {
          if (exp === '>' || exp === '>=') {
            params.date_created_gt = timestamp;
          } else if (exp === '<' || exp === '<=') {
            params.date_created_lt = timestamp;
          } else if (exp === 'range' && args.length >= 3) {
            const lowValue = (args[1] as TQoreSearchRecordsValue)?.value;
            const highValue = (args[2] as TQoreSearchRecordsValue)?.value;
            const lowTimestamp = convertToTimestamp(lowValue);
            const highTimestamp = convertToTimestamp(highValue);
            if (lowTimestamp !== null) {
              params.date_created_gt = lowTimestamp;
            }
            if (highTimestamp !== null) {
              params.date_created_lt = highTimestamp;
            }
          }
        }
        return;
      }

      case 'date_updated': {
        const timestamp = convertToTimestamp(value);
        if (timestamp !== null) {
          if (exp === '>' || exp === '>=') {
            params.date_updated_gt = timestamp;
          } else if (exp === '<' || exp === '<=') {
            params.date_updated_lt = timestamp;
          } else if (exp === 'range' && args.length >= 3) {
            const lowValue = (args[1] as TQoreSearchRecordsValue)?.value;
            const highValue = (args[2] as TQoreSearchRecordsValue)?.value;
            const lowTimestamp = convertToTimestamp(lowValue);
            const highTimestamp = convertToTimestamp(highValue);
            if (lowTimestamp !== null) {
              params.date_updated_gt = lowTimestamp;
            }
            if (highTimestamp !== null) {
              params.date_updated_lt = highTimestamp;
            }
          }
        }
        return;
      }

      default:
        break;
    }

    // Handle custom fields (prefixed with cf_)
    if (fieldName.startsWith('cf_')) {
      const cfName = fieldName.slice(3); // Remove cf_ prefix
      const fieldId = customFieldMap.get(cfName);

      if (fieldId && clickUpOp) {
        params.custom_fields = params.custom_fields || [];

        if (exp === 'range' && args.length >= 3) {
          const lowValue = (args[1] as TQoreSearchRecordsValue)?.value;
          const highValue = (args[2] as TQoreSearchRecordsValue)?.value;
          params.custom_fields.push({
            field_id: fieldId,
            operator: 'RANGE',
            value: [lowValue, highValue],
          });
        } else if (exp === 'is-set' || exp === 'is-not-set') {
          params.custom_fields.push({
            field_id: fieldId,
            operator: clickUpOp,
          });
        } else {
          params.custom_fields.push({
            field_id: fieldId,
            operator: clickUpOp,
            value: value,
          });
        }
      }
    }
  };

  processCondition(where);
  return params;
};

/**
 * Convert various date formats to Unix timestamp in milliseconds
 */
const convertToTimestamp = (value: unknown): number | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    // Already a timestamp - check if seconds or milliseconds
    if (value < 10000000000) {
      // Likely seconds, convert to milliseconds
      return value * 1000;
    }
    return value;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return null;
};

/**
 * Convert ClickUp filter params to query string parameters
 */
export const filterParamsToQueryParams = (
  params: ClickUpFilterParams
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {};

  if (params.statuses?.length) {
    queryParams['statuses[]'] = params.statuses;
  }

  if (params.assignees?.length) {
    queryParams['assignees[]'] = params.assignees;
  }

  if (params.tags?.length) {
    queryParams['tags[]'] = params.tags;
  }

  if (params.priority?.length) {
    queryParams['priority[]'] = params.priority.map(String);
  }

  if (params.due_date_gt !== undefined) {
    queryParams.due_date_gt = String(params.due_date_gt);
  }

  if (params.due_date_lt !== undefined) {
    queryParams.due_date_lt = String(params.due_date_lt);
  }

  if (params.date_created_gt !== undefined) {
    queryParams.date_created_gt = String(params.date_created_gt);
  }

  if (params.date_created_lt !== undefined) {
    queryParams.date_created_lt = String(params.date_created_lt);
  }

  if (params.date_updated_gt !== undefined) {
    queryParams.date_updated_gt = String(params.date_updated_gt);
  }

  if (params.date_updated_lt !== undefined) {
    queryParams.date_updated_lt = String(params.date_updated_lt);
  }

  if (params.custom_fields?.length) {
    queryParams.custom_fields = JSON.stringify(params.custom_fields);
  }

  return queryParams;
};
