import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { applySupabaseComparisonOperator } from './apply-comparison-operator';

export const applySupabaseWhereCondition = (
  query: PostgrestFilterBuilder<any, any, any, any>,
  where_cond: TQoreSearchRecordsWhereConditions
): PostgrestFilterBuilder<any, any, any, any> => {
  const { exp, args } = where_cond;

  switch (exp) {
    case 'AND':
      return args.reduce((q, arg) => {
        if (isQoreRecordSearchExpression(arg)) {
          return applySupabaseWhereCondition(q, arg);
        }
        return q;
      }, query);

    case 'OR': {
      if (args.length === 0) return query;

      const orConditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => {
          if (arg.exp === 'AND') {
            return buildAndCondition(arg);
          } else if (arg.exp === 'OR') {
            return buildOrCondition(arg);
          } else {
            return buildFilterCondition(arg);
          }
        })
        .filter(Boolean);

      if (orConditions.length > 0) {
        return query.or(orConditions.join(','));
      }
      return query;
    }

    case 'NOT':
      if (args.length > 0 && isQoreRecordSearchExpression(args[0])) {
        const innerExpr = args[0];

        if (innerExpr.args.length >= 2 && isQoreRecordSearchFieldReference(innerExpr.args[0])) {
          const field = innerExpr.args[0].field;
          const value = innerExpr.args[1] as TQoreSearchRecordsValue;

          switch (innerExpr.exp) {
            case '=':
              return query.not(field, 'eq', value);
            case '!=':
              return query.not(field, 'neq', value);
            case '>':
              return query.not(field, 'gt', value);
            case '>=':
              return query.not(field, 'gte', value);
            case '<':
              return query.not(field, 'lt', value);
            case '<=':
              return query.not(field, 'lte', value);
            case 'like':
              return query.not(field, 'like', value);
            case 'ilike':
              return query.not(field, 'ilike', value);
            case 'in':
              return query.not(field, 'in', Array.isArray(value) ? value : [value]);
          }
        }
      }
      return query;
    case '=':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
    case 'like':
    case 'ilike':
    case 'in':
      return applySupabaseComparisonOperator(query, exp, args);
    default:
      return query;
  }
};

const buildAndCondition = (expr: TQoreSearchRecordsWhereConditions): string | null => {
  const conditions = expr.args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => {
      if (arg.exp === 'OR') {
        return buildOrCondition(arg);
      }
      return buildFilterCondition(arg);
    })
    .filter(Boolean);

  if (conditions.length === 0) return null;

  return `and(${conditions.join(',')})`;
};

const buildOrCondition = (expr: TQoreSearchRecordsWhereConditions): string | null => {
  const conditions = expr.args
    .filter(isQoreRecordSearchExpression)
    .map((arg) => buildFilterCondition(arg))
    .filter(Boolean);

  if (conditions.length === 0) return null;

  return `or(${conditions.join(',')})`;
};

const buildFilterCondition = (expr: TQoreSearchRecordsWhereConditions): string | null => {
  const { exp, args } = expr;

  if (args.length < 2) return null;

  const fieldArg = args[0];
  const valueArg = args[1] as TQoreSearchRecordsValue;

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;

  switch (exp) {
    case '=':
      return `${field}.eq.${valueArg}`;
    case '!=':
      return `${field}.neq.${valueArg}`;
    case '>':
      return `${field}.gt.${valueArg}`;
    case '>=':
      return `${field}.gte.${valueArg}`;
    case '<':
      return `${field}.lt.${valueArg}`;
    case '<=':
      return `${field}.lte.${valueArg}`;
    case 'like':
      return `${field}.like.${valueArg}`;
    case 'ilike':
      return `${field}.ilike.${valueArg}`;
    case 'in':
      const inValues = Array.isArray(valueArg) ? valueArg : [valueArg];
      return `${field}.in.(${inValues.join(',')})`;
    default:
      return null;
  }
};
