/**
 * Jira Apply Where Condition
 *
 * Converts Qore WHERE conditions to JQL (Jira Query Language).
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { CUSTOM_FIELD_PREFIX, JiraField } from './constants';

/**
 * Map Qore field names to JQL field names
 */
const FIELD_NAME_MAP: Record<string, string> = {
  id: 'id',
  key: 'key',
  summary: 'summary',
  description: 'description',
  status: 'status',
  statusId: 'status',
  priority: 'priority',
  priorityId: 'priority',
  issuetype: 'issuetype',
  issuetypeId: 'issuetype',
  assignee: 'assignee',
  assigneeName: 'assignee',
  reporter: 'reporter',
  reporterName: 'reporter',
  created: 'created',
  updated: 'updated',
  duedate: 'duedate',
  resolution: 'resolution',
  resolutionId: 'resolution',
  labels: 'labels',
  components: 'component',
  fixVersions: 'fixVersion',
  affectsVersions: 'affectedVersion',
  project: 'project',
  projectId: 'project',
  projectName: 'project',
};

/**
 * Escape JQL string value
 */
const escapeJqlValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'EMPTY';
  }
  const str = String(value);
  // Escape quotes and wrap in quotes
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
};

/**
 * Format date for JQL
 */
const formatDateForJql = (value: unknown): string => {
  if (value instanceof Date) {
    return `"${value.toISOString().split('T')[0]}"`;
  }
  if (typeof value === 'string') {
    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return `"${date.toISOString().split('T')[0]}"`;
    }
  }
  return escapeJqlValue(value);
};

/**
 * Check if a field is a date field
 */
const isDateField = (field: string): boolean => {
  const dateFields = ['created', 'updated', 'duedate', 'resolutiondate'];
  return dateFields.includes(field.toLowerCase());
};

/**
 * Process a single expression into JQL
 */
const processExpression = (
  where: TQoreSearchRecordsWhereConditions,
  customFieldMap: Map<string, JiraField>
): string => {
  const exp = where.exp;
  const args = where.args || [];

  // Handle logical operators
  if (exp === '&&') {
    const conditions = args
      .filter(
        (arg): arg is TQoreSearchRecordsWhereConditions =>
          typeof arg === 'object' && arg !== null && 'exp' in arg
      )
      .map((arg) => processExpression(arg, customFieldMap))
      .filter((c) => c);
    return conditions.length > 0 ? `(${conditions.join(' AND ')})` : '';
  }

  if (exp === '||') {
    const conditions = args
      .filter(
        (arg): arg is TQoreSearchRecordsWhereConditions =>
          typeof arg === 'object' && arg !== null && 'exp' in arg
      )
      .map((arg) => processExpression(arg, customFieldMap))
      .filter((c) => c);
    return conditions.length > 0 ? `(${conditions.join(' OR ')})` : '';
  }

  // Get field reference and value
  const fieldArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || typeof fieldArg !== 'object' || !('field' in fieldArg)) {
    return '';
  }

  const field = fieldArg.field as string;
  const value =
    valueArg && typeof valueArg === 'object' && 'value' in valueArg ? valueArg.value : undefined;

  // Check if custom field
  const isCustomField = field.startsWith(CUSTOM_FIELD_PREFIX);
  let jqlField: string;

  if (isCustomField) {
    const fieldName = field.slice(CUSTOM_FIELD_PREFIX.length).replace(/_/g, ' ');
    const fieldDef = [...customFieldMap.values()].find(
      (f) => f.name === fieldName || f.name.replace(/\s+/g, '_') === field.slice(CUSTOM_FIELD_PREFIX.length)
    );
    // Use cf[id] syntax for custom fields
    jqlField = fieldDef ? `cf[${fieldDef.id.replace('customfield_', '')}]` : `"${fieldName}"`;
  } else {
    jqlField = FIELD_NAME_MAP[field] || field;
  }

  // Determine if this is a date field for proper formatting
  const useDate = isDateField(jqlField);

  // Build JQL based on operator
  switch (exp) {
    case '==':
      return `${jqlField} = ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case '!=':
      return `${jqlField} != ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case '>':
      return `${jqlField} > ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case '>=':
      return `${jqlField} >= ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case '<':
      return `${jqlField} < ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case '<=':
      return `${jqlField} <= ${useDate ? formatDateForJql(value) : escapeJqlValue(value)}`;
    case 'contains':
      return `${jqlField} ~ ${escapeJqlValue(value)}`;
    case 'is-set':
      return `${jqlField} IS NOT EMPTY`;
    case 'is-not-set':
      return `${jqlField} IS EMPTY`;
    default:
      return '';
  }
};

/**
 * Build JQL query from WHERE conditions
 */
export const buildJqlFromWhere = (
  projectKey: string,
  where?: TQoreSearchRecordsWhereConditions,
  customFieldMap?: Map<string, JiraField>
): string => {
  const conditions: string[] = [`project = "${projectKey}"`];

  if (where) {
    const whereJql = processExpression(where, customFieldMap || new Map());
    if (whereJql) {
      conditions.push(whereJql);
    }
  }

  return conditions.join(' AND ');
};
