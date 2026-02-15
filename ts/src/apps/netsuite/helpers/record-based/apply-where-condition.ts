/**
 * NetSuite WHERE Condition Builder
 *
 * Converts Qore WHERE condition trees into SuiteQL WHERE clauses.
 * Handles logical operators (AND/OR), comparison operators, and string operators.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';
import { escapeSqlIdentifier, escapeSqlValue } from './constants';

/**
 * Process a single expression node into a SQL clause.
 */
const processExpression = (where: TQoreSearchRecordsWhereConditions): string => {
  const exp = where.exp;
  const args = where.args || [];

  // Handle logical operators (AND, OR)
  if (exp === '&&') {
    const clauses = args
      .filter((a): a is TQoreSearchRecordsWhereConditions => typeof a === 'object' && 'exp' in a)
      .map((a) => processExpression(a))
      .filter((c) => c.length > 0);
    return clauses.length > 0 ? `(${clauses.join(' AND ')})` : '';
  }

  if (exp === '||') {
    const clauses = args
      .filter((a): a is TQoreSearchRecordsWhereConditions => typeof a === 'object' && 'exp' in a)
      .map((a) => processExpression(a))
      .filter((c) => c.length > 0);
    return clauses.length > 0 ? `(${clauses.join(' OR ')})` : '';
  }

  // Extract field reference and value from args
  const fieldArg = args.find(
    (a): a is { type_code: string; field: string } =>
      typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'field reference'
  );
  const valueArg = args.find(
    (a): a is { type_code: string; value: unknown } =>
      typeof a === 'object' && a !== null && 'type_code' in a && a.type_code === 'value'
  );

  if (!fieldArg || !('field' in fieldArg)) {
    return '';
  }

  const field = escapeSqlIdentifier(fieldArg.field as string);
  const value = valueArg && 'value' in valueArg ? valueArg.value : undefined;

  switch (exp) {
    case '==':
      return `${field} = ${escapeSqlValue(value)}`;
    case '!=':
      return `${field} != ${escapeSqlValue(value)}`;
    case '>':
      return `${field} > ${escapeSqlValue(value)}`;
    case '>=':
      return `${field} >= ${escapeSqlValue(value)}`;
    case '<':
      return `${field} < ${escapeSqlValue(value)}`;
    case '<=':
      return `${field} <= ${escapeSqlValue(value)}`;
    case 'is-set':
      return `${field} IS NOT NULL`;
    case 'is-not-set':
      return `${field} IS NULL`;
    case 'contains':
      return `${field} LIKE ${escapeSqlValue(`%${value}%`)}`;
    case 'starts-with':
      return `${field} LIKE ${escapeSqlValue(`${value}%`)}`;
    case 'ends-with':
      return `${field} LIKE ${escapeSqlValue(`%${value}`)}`;
    default:
      return '';
  }
};

/**
 * Build a SuiteQL WHERE clause from a Qore WHERE condition tree.
 * Returns an empty string if no conditions are provided.
 */
export const buildSuiteQlWhereClause = (
  where: TQoreSearchRecordsWhereConditions | undefined
): string => {
  if (!where || !where.exp) {
    return '';
  }
  return processExpression(where);
};
