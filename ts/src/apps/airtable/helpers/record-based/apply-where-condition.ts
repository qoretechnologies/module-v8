import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

export const buildAirtableFilterFormula = (
  where_cond: TQoreSearchRecordsWhereConditions
): string => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&': {
      const conditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildAirtableFilterFormula(arg))
        .filter((c) => c !== '');

      if (conditions.length === 0) return '';
      if (conditions.length === 1) return conditions[0];
      return `AND(${conditions.join(', ')})`;
    }

    case '||': {
      const conditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildAirtableFilterFormula(arg))
        .filter((c) => c !== '');

      if (conditions.length === 0) return '';
      if (conditions.length === 1) return conditions[0];
      return `OR(${conditions.join(', ')})`;
    }

    case 'not': {
      const innerCondition = args.find(isQoreRecordSearchExpression);
      if (!innerCondition) return '';
      return `NOT(${buildAirtableFilterFormula(innerCondition)})`;
    }

    case 'xor': {
      const conditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildAirtableFilterFormula(arg))
        .filter((c) => c !== '');

      if (conditions.length === 0) return '';
      if (conditions.length === 1) return conditions[0];
      return `XOR(${conditions.join(', ')})`;
    }

    default: {
      return buildSingleCondition(where_cond);
    }
  }
};

const escapeFormulaValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'BLANK()';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE()' : 'FALSE()';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  const stringValue = String(value).replace(/'/g, "\\'");
  return `'${stringValue}'`;
};

const buildSingleCondition = (expr: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = expr;

  if (args.length < 1) return '';

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) return '';

  const field = `{${fieldArg.field}}`;
  const rawValue = (args[1] as TQoreSearchRecordsValue)?.value;

  switch (exp) {
    case '==':
      return `${field} = ${escapeFormulaValue(rawValue)}`;

    case '!=':
      return `${field} != ${escapeFormulaValue(rawValue)}`;

    case '>':
      return `${field} > ${escapeFormulaValue(rawValue)}`;

    case '>=':
      return `${field} >= ${escapeFormulaValue(rawValue)}`;

    case '<':
      return `${field} < ${escapeFormulaValue(rawValue)}`;

    case '<=':
      return `${field} <= ${escapeFormulaValue(rawValue)}`;

    case 'contains':
      return `FIND(${escapeFormulaValue(rawValue)}, ${field}) > 0`;

    case 'contains-not':
      return `FIND(${escapeFormulaValue(rawValue)}, ${field}) = 0`;

    case 'empty':
      return `OR(${field} = '', ${field} = BLANK())`;

    case 'not-empty':
      return `AND(${field} != '', ${field} != BLANK())`;

    case 'starts-with':
      return `LEFT(${field}, ${String(rawValue).length}) = ${escapeFormulaValue(rawValue)}`;

    case 'ends-with':
      return `RIGHT(${field}, ${String(rawValue).length}) = ${escapeFormulaValue(rawValue)}`;

    case 'is-before':
      return `IS_BEFORE(${field}, ${escapeFormulaValue(rawValue)})`;

    case 'is-after':
      return `IS_AFTER(${field}, ${escapeFormulaValue(rawValue)})`;

    case 'is-same':
      return `IS_SAME(${field}, ${escapeFormulaValue(rawValue)})`;

    case 'boolean':
      return rawValue ? `${field}` : `NOT(${field})`;

    case 'regex-match':
      return `REGEX_MATCH(${field}, ${escapeFormulaValue(rawValue)})`;

    case 'find':
      return `FIND(${escapeFormulaValue(rawValue)}, ${field})`;

    case 'search':
      return `SEARCH(${escapeFormulaValue(rawValue)}, ${field})`;

    case 'len':
      return `LEN(${field})`;

    case 'lower':
      return `LOWER(${field})`;

    case 'upper':
      return `UPPER(${field})`;

    case 'trim':
      return `TRIM(${field})`;

    case 'abs':
      return `ABS(${field})`;

    case 'round':
      return `ROUND(${field}, ${escapeFormulaValue(rawValue)})`;

    case 'floor':
      return `FLOOR(${field})`;

    case 'ceiling':
      return `CEILING(${field})`;

    case 'mod':
      return `MOD(${field}, ${escapeFormulaValue(rawValue)})`;

    default:
      return `${field} = ${escapeFormulaValue(rawValue)}`;
  }
};
