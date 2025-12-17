import {
  TQoreSearchRecordsWhereConditions,
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
} from '@qoretechnologies/ts-toolkit';
import { TZendeskTable } from './get-table-list';
import { CUSTOM_OBJECT_STANDARD_FIELDS } from './types';

export type TZendeskCustomObjectFilter =
  | {
      $and?: TZendeskCustomObjectFilterCondition[];
      $or?: TZendeskCustomObjectFilterCondition[];
    }
  | TZendeskCustomObjectFilterCondition;

export type TZendeskCustomObjectFilterCondition = {
  [field: string]: {
    $eq?: any;
    $ne?: any;
    $noteq?: any;
    $gt?: any;
    $gte?: any;
    $lt?: any;
    $lte?: any;
    $starts_with?: string;
    $ends_with?: string;
    $contains?: string;
  };
};

export const applyZendeskWhereCondition = (
  whereConditions?: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): string => {
  if (!whereConditions) {
    return '';
  }

  return buildZendeskCondition(whereConditions, tableName);
};

export const applyZendeskCustomObjectWhereCondition = (
  whereConditions?: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): TZendeskCustomObjectFilter | undefined => {
  if (!whereConditions) {
    return undefined;
  }

  return buildCustomObjectCondition(whereConditions, tableName);
};

const buildZendeskCondition = (
  condition: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): string => {
  const { exp } = condition;

  switch (exp) {
    case '&&':
      return buildAndCondition(condition, tableName);
    case '||':
      return buildOrCondition(condition, tableName);
    case '==':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return buildComparisonCondition(condition, tableName);
    default:
      return '';
  }
};

const buildAndCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): string => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildZendeskCondition(arg, tableName))
    .filter((condition) => condition.length > 0);

  if (conditions.length === 0) {
    return '';
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return conditions.join(' ');
};

const buildOrCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): string => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildZendeskCondition(arg, tableName))
    .filter((condition) => condition.length > 0);

  if (conditions.length === 0) {
    return '';
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return `${conditions.join(' ')}`;
};

const buildComparisonCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): string => {
  const { exp, args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) {
    return '';
  }

  const field = mapFieldName(fieldArg.field, tableName);

  switch (exp) {
    case '==':
      return buildEqualCondition(field, args[1]);
    case '!=':
      return buildNotEqualCondition(field, args[1]);
    case '>':
      return buildGreaterThanCondition(field, args[1]);
    case '>=':
      return buildGreaterThanOrEqualCondition(field, args[1]);
    case '<':
      return buildLessThanCondition(field, args[1]);
    case '<=':
      return buildLessThanOrEqualCondition(field, args[1]);
    default:
      return '';
  }
};

const mapFieldName = (field: string, tableName?: TZendeskTable): string => {
  const commonMappings: Record<string, string> = {
    id: 'id',
    created_at: 'created',
    updated_at: 'updated',
  };

  const tableMappings: Record<TZendeskTable, Record<string, string>> = {
    tickets: {
      subject: 'subject',
      description: 'description',
      status: 'status',
      priority: 'priority',
      type: 'ticket_type',
      assignee_id: 'assignee',
      requester_id: 'requester',
      group_id: 'group',
      organization_id: 'organization',
      tags: 'tags',
    },
    users: {
      name: 'name',
      email: 'email',
      role: 'role',
      organization_id: 'organization',
    },
    organizations: {
      name: 'name',
      external_id: 'external_id',
      domain_names: 'domain',
    },
  };

  if (commonMappings[field]) {
    return commonMappings[field];
  }

  if (tableName && tableMappings[tableName]?.[field]) {
    return tableMappings[tableName][field];
  }

  return field;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'none';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    if (value.includes(' ')) {
      return `"${value}"`;
    }
    return value;
  }

  return String(value);
};

const buildEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field}:${formatValue(value)}`;
};

const buildNotEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `-${field}:${formatValue(value)}`;
};

const buildGreaterThanCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field}>${formatValue(value)}`;
};

const buildGreaterThanOrEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field}>=${formatValue(value)}`;
};

const buildLessThanCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field}<${formatValue(value)}`;
};

const buildLessThanOrEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field}<=${formatValue(value)}`;
};

const mapCustomObjectFieldName = (field: string): string => {
  if (CUSTOM_OBJECT_STANDARD_FIELDS.includes(field)) {
    return field;
  }
  return `custom_object_fields.${field}`;
};

const buildCustomObjectCondition = (
  condition: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): TZendeskCustomObjectFilter | undefined => {
  const { exp } = condition;

  switch (exp) {
    case '&&':
      return buildCustomObjectAndCondition(condition, tableName);
    case '||':
      return buildCustomObjectOrCondition(condition, tableName);
    case '==':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
      return buildCustomObjectComparisonCondition(condition, tableName);
    default:
      return undefined;
  }
};

const buildCustomObjectAndCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): TZendeskCustomObjectFilter | undefined => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return undefined;
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildCustomObjectCondition(arg, tableName))
    .filter((condition): condition is TZendeskCustomObjectFilter => condition !== undefined);

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $and: conditions as TZendeskCustomObjectFilterCondition[] };
};

const buildCustomObjectOrCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  tableName?: TZendeskTable
): TZendeskCustomObjectFilter | undefined => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return undefined;
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildCustomObjectCondition(arg, tableName))
    .filter((condition): condition is TZendeskCustomObjectFilter => condition !== undefined);

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { $or: conditions as TZendeskCustomObjectFilterCondition[] };
};

const buildCustomObjectComparisonCondition = (
  expression: TQoreSearchRecordsWhereConditions,
  _tableName?: TZendeskTable
): TZendeskCustomObjectFilterCondition | undefined => {
  const { exp, args } = expression;

  if (!args || args.length === 0) {
    return undefined;
  }

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) {
    return undefined;
  }

  const field = mapCustomObjectFieldName(fieldArg.field);
  const value = (args[1] as TQoreSearchRecordsValue).value;

  switch (exp) {
    case '==':
      return { [field]: { $eq: value } };
    case '!=':
      return { [field]: { $noteq: value } };
    case '>':
      return { [field]: { $gt: value } };
    case '>=':
      return { [field]: { $gte: value } };
    case '<':
      return { [field]: { $lt: value } };
    case '<=':
      return { [field]: { $lte: value } };
    default:
      return undefined;
  }
};
