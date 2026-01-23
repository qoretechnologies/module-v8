/**
 * Asana Apply Where Condition
 *
 * Converts Qore WHERE conditions to Asana search API filter parameters.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { CUSTOM_FIELD_PREFIX, DATE_FILTER_FIELDS, TCustomFieldInfo } from './constants';

/**
 * Asana search filter parameters structure
 */
export interface AsanaFilterParams {
  completed?: boolean;
  'assignee.any'?: string;
  'projects.any'?: string;
  'sections.any'?: string;
  'tags.any'?: string;
  'followers.any'?: string;
  'created_by.any'?: string;
  'due_on.before'?: string;
  'due_on.after'?: string;
  'due_at.before'?: string;
  'due_at.after'?: string;
  'start_on.before'?: string;
  'start_on.after'?: string;
  'start_at.before'?: string;
  'start_at.after'?: string;
  'created_at.before'?: string;
  'created_at.after'?: string;
  'modified_at.before'?: string;
  'modified_at.after'?: string;
  'completed_at.before'?: string;
  'completed_at.after'?: string;
  text?: string;
  [key: string]: unknown;
}

/**
 * Format a date value for Asana API (ISO format date only)
 */
const formatDateForAsana = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    // If it's already a date string, extract just the date part
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return value;
  }
  return String(value);
};

/**
 * Process a single WHERE condition expression
 */
const processExpression = (
  where: TQoreSearchRecordsWhereConditions,
  params: AsanaFilterParams,
  customFieldMap: Map<string, TCustomFieldInfo>
): void => {
  const exp = where.exp;
  const args = where.args || [];

  // Handle logical operators
  if (exp === '&&' || exp === '||') {
    for (const arg of args) {
      if (typeof arg === 'object' && 'exp' in arg) {
        processExpression(arg as TQoreSearchRecordsWhereConditions, params, customFieldMap);
      }
    }
    return;
  }

  // Get field reference and value
  const fieldArg = args.find((a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'field reference');
  const valueArg = args.find((a) => typeof a === 'object' && 'type_code' in a && a.type_code === 'value');

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return;
  }

  const field = fieldArg.field as string;
  const value = valueArg && typeof valueArg === 'object' && 'value' in valueArg ? valueArg.value : undefined;

  // Check if this is a custom field
  const isCustomField = field.startsWith(CUSTOM_FIELD_PREFIX);
  const cleanFieldName = isCustomField ? field.slice(CUSTOM_FIELD_PREFIX.length) : field;
  const customFieldInfo = isCustomField ? customFieldMap.get(cleanFieldName) : undefined;

  // Handle custom field filters
  if (isCustomField && customFieldInfo) {
    const cfGid = customFieldInfo.gid;

    switch (exp) {
      case '==':
        params[`custom_fields.${cfGid}.value`] = value;
        break;
      case 'is-set':
        params[`custom_fields.${cfGid}.is_set`] = true;
        break;
      case 'is-not-set':
        params[`custom_fields.${cfGid}.is_set`] = false;
        break;
      case 'contains':
        params[`custom_fields.${cfGid}.contains`] = value;
        break;
      case 'starts-with':
        params[`custom_fields.${cfGid}.starts_with`] = value;
        break;
      case 'ends-with':
        params[`custom_fields.${cfGid}.ends_with`] = value;
        break;
      case '>':
        params[`custom_fields.${cfGid}.greater_than`] = value;
        break;
      case '<':
        params[`custom_fields.${cfGid}.less_than`] = value;
        break;
      case '>=':
        // Asana doesn't have >= directly, use > with value - 1 for numbers
        if (typeof value === 'number') {
          params[`custom_fields.${cfGid}.greater_than`] = value - 0.0001;
        }
        break;
      case '<=':
        // Asana doesn't have <= directly, use < with value + 1 for numbers
        if (typeof value === 'number') {
          params[`custom_fields.${cfGid}.less_than`] = value + 0.0001;
        }
        break;
    }
    return;
  }

  // Handle standard field filters
  switch (field) {
    case 'completed':
      if (exp === '==') {
        params.completed = value === true || value === 'true';
      } else if (exp === '!=') {
        params.completed = value !== true && value !== 'true';
      }
      break;

    case 'assignee':
      if (exp === '==') {
        params['assignee.any'] = String(value);
      } else if (exp === 'is-set') {
        params['assignee.not'] = 'null';
      } else if (exp === 'is-not-set') {
        params['assignee.any'] = 'null';
      }
      break;

    case 'projects':
      if (exp === '==') {
        params['projects.any'] = String(value);
      }
      break;

    case 'sections':
      if (exp === '==') {
        params['sections.any'] = String(value);
      }
      break;

    case 'tags':
      if (exp === '==') {
        params['tags.any'] = String(value);
      }
      break;

    case 'followers':
      if (exp === '==') {
        params['followers.any'] = String(value);
      }
      break;

    case 'name':
    case 'notes':
      // Use text search for name and notes
      if (exp === 'contains' || exp === '==') {
        params.text = String(value);
      }
      break;

    default:
      // Handle date fields
      if (DATE_FILTER_FIELDS.includes(field as typeof DATE_FILTER_FIELDS[number])) {
        const dateValue = formatDateForAsana(value);
        switch (exp) {
          case '==':
            // For equality, set both before and after to same date
            params[`${field}.after`] = dateValue;
            params[`${field}.before`] = dateValue;
            break;
          case '>':
            params[`${field}.after`] = dateValue;
            break;
          case '>=':
            params[`${field}.after`] = dateValue;
            break;
          case '<':
            params[`${field}.before`] = dateValue;
            break;
          case '<=':
            params[`${field}.before`] = dateValue;
            break;
        }
      }
      break;
  }
};

/**
 * Build Asana search filter parameters from Qore WHERE conditions.
 */
export const buildAsanaFilter = (
  where: TQoreSearchRecordsWhereConditions,
  customFieldMap: Map<string, TCustomFieldInfo>
): AsanaFilterParams => {
  const params: AsanaFilterParams = {};
  processExpression(where, params, customFieldMap);
  return params;
};

/**
 * Convert filter params to query string parameters for Asana search API.
 */
export const filterParamsToQueryParams = (params: AsanaFilterParams): Record<string, string> => {
  const queryParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        queryParams[key] = value ? 'true' : 'false';
      } else {
        queryParams[key] = String(value);
      }
    }
  }

  return queryParams;
};
