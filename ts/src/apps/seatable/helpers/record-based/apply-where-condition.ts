import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

/**
 * SeaTable SQL filter syntax
 *
 * SeaTable uses SQL WHERE syntax for filtering:
 * - Equality: `column_name` = 'value'
 * - Comparison: `column_name` > 5
 * - Contains: `column_name` LIKE '%value%'
 * - Empty check: `column_name` IS NULL OR `column_name` = ''
 * - Logical: AND, OR
 */

/**
 * Maps Qore expression operators to SeaTable SQL operators
 */
const EXPRESSION_KEY_TO_SQL: Record<string, string> = {
  '==': '=',
  '!=': '!=',
  '>': '>',
  '>=': '>=',
  '<': '<',
  '<=': '<=',
  contains: 'LIKE',
  'not-contains': 'NOT LIKE',
};

/**
 * Builds a SeaTable SQL WHERE clause from Qore search conditions
 */
export const buildSeaTableFilter = (where_cond: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&':
    case '||': {
      const logicalOp = exp === '&&' ? ' AND ' : ' OR ';
      const conditions: string[] = [];

      args.filter(isQoreRecordSearchExpression).forEach((arg) => {
        const filterStr = buildSeaTableFilter(arg);
        if (filterStr) {
          conditions.push(`(${filterStr})`);
        }
      });

      return conditions.join(logicalOp);
    }

    default: {
      return buildSingleFilter(where_cond) || '';
    }
  }
};

const escapeString = (value: string): string => {
  // Escape single quotes for SQL
  return value.replace(/'/g, "''");
};

const buildSingleFilter = (expr: TQoreSearchRecordsWhereConditions): string | null => {
  const { exp, args } = expr;

  if (args.length < 1) {
    return null;
  }

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) {
    return null;
  }

  const field = `\`${fieldArg.field}\``;
  const rawValue = (args[1] as TQoreSearchRecordsValue)?.value;

  // Handle empty/not-empty checks
  if (exp === 'empty') {
    return `(${field} IS NULL OR ${field} = '')`;
  }

  if (exp === 'not-empty') {
    return `(${field} IS NOT NULL AND ${field} != '')`;
  }

  const sqlOperator = EXPRESSION_KEY_TO_SQL[exp];
  if (!sqlOperator) {
    return null;
  }

  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  // Format value based on type
  let formattedValue: string;
  if (typeof rawValue === 'boolean') {
    formattedValue = rawValue ? 'true' : 'false';
  } else if (typeof rawValue === 'number') {
    formattedValue = String(rawValue);
  } else if (typeof rawValue === 'string') {
    // Handle LIKE operations with wildcards
    if (exp === 'contains' || exp === 'not-contains') {
      formattedValue = `'%${escapeString(rawValue)}%'`;
    } else {
      formattedValue = `'${escapeString(rawValue)}'`;
    }
  } else {
    formattedValue = `'${escapeString(String(rawValue))}'`;
  }

  return `${field} ${sqlOperator} ${formattedValue}`;
};
