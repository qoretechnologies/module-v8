import {
  TQoreSearchRecordsWhereConditions,
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
} from '@qoretechnologies/ts-toolkit';

export const applyZohoCrmWhereCondition = (
  whereConditions?: TQoreSearchRecordsWhereConditions
): string => {
  if (!whereConditions) {
    return '';
  }

  return buildCoqlCondition(whereConditions);
};

const buildCoqlCondition = (condition: TQoreSearchRecordsWhereConditions): string => {
  const { exp } = condition;

  switch (exp) {
    case '&&':
      return buildAndCondition(condition);
    case '||':
      return buildOrCondition(condition);
    case '==':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
    case 'like':
    case 'not-like':
    case 'in':
    case 'not-in':
    case 'between':
    case 'not-between':
    case 'is-null':
    case 'is-not-null':
      return buildComparisonCondition(condition);
    default:
      return '';
  }
};

const buildAndCondition = (expression: TQoreSearchRecordsWhereConditions): string => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildCoqlCondition(arg))
    .filter((condition) => condition.length > 0);

  if (conditions.length === 0) {
    return '';
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return `(${conditions.join(' and ')})`;
};

const buildOrCondition = (expression: TQoreSearchRecordsWhereConditions): string => {
  const { args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const conditions = args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildCoqlCondition(arg))
    .filter((condition) => condition.length > 0);

  if (conditions.length === 0) {
    return '';
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return `(${conditions.join(' or ')})`;
};

const buildComparisonCondition = (expression: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = expression;

  if (!args || args.length === 0) {
    return '';
  }

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) {
    return '';
  }

  const field = fieldArg.field;

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
    case 'like':
      return buildLikeCondition(field, args[1]);
    case 'not-like':
      return buildNotLikeCondition(field, args[1]);
    case 'in':
      return buildInCondition(field, args[1]);
    case 'not-in':
      return buildNotInCondition(field, args[1]);
    case 'between':
      return buildBetweenCondition(field, args[1], args[2]);
    case 'not-between':
      return buildNotBetweenCondition(field, args[1], args[2]);
    case 'is-null':
      return buildIsNullCondition(field);
    case 'is-not-null':
      return buildIsNotNullCondition(field);
    default:
      return '';
  }
};

const escapeStringValue = (value: any): string => {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return String(value);
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return escapeStringValue(value);
  }

  return escapeStringValue(String(value));
};

const buildEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} = ${formatValue(value)}`;
};

const buildNotEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} != ${formatValue(value)}`;
};

const buildGreaterThanCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} > ${formatValue(value)}`;
};

const buildGreaterThanOrEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} >= ${formatValue(value)}`;
};

const buildLessThanCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} < ${formatValue(value)}`;
};

const buildLessThanOrEqualCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} <= ${formatValue(value)}`;
};

const buildLikeCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} like ${formatValue(value)}`;
};

const buildNotLikeCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  return `${field} not like ${formatValue(value)}`;
};

const buildInCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  if (!Array.isArray(value)) {
    return `${field} in (${formatValue(value)})`;
  }

  const formattedValues = value.map((v) => formatValue(v)).join(', ');
  return `${field} in (${formattedValues})`;
};

const buildNotInCondition = (field: string, valueArg: any): string => {
  const value = (valueArg as TQoreSearchRecordsValue).value;
  if (!Array.isArray(value)) {
    return `${field} not in (${formatValue(value)})`;
  }

  const formattedValues = value.map((v) => formatValue(v)).join(', ');
  return `${field} not in (${formattedValues})`;
};

const buildBetweenCondition = (field: string, valueArg1: any, valueArg2: any): string => {
  const value1 = (valueArg1 as TQoreSearchRecordsValue).value;
  const value2 = (valueArg2 as TQoreSearchRecordsValue).value;
  return `${field} between ${formatValue(value1)} and ${formatValue(value2)}`;
};

const buildNotBetweenCondition = (field: string, valueArg1: any, valueArg2: any): string => {
  const value1 = (valueArg1 as TQoreSearchRecordsValue).value;
  const value2 = (valueArg2 as TQoreSearchRecordsValue).value;
  return `${field} not between ${formatValue(value1)} and ${formatValue(value2)}`;
};

const buildIsNullCondition = (field: string): string => {
  return `${field} is null`;
};

const buildIsNotNullCondition = (field: string): string => {
  return `${field} is not null`;
};
