import {
  isQoreRecordSearchFieldReference,
  TQoreRecordSearchValue,
  TQoreSearchRecordsValue,
} from '@qoretechnologies/ts-toolkit';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export const applySupabaseComparisonOperator = (
  query: PostgrestFilterBuilder<any, any, any, any>,
  operator: string,
  args: Array<TQoreRecordSearchValue>
): PostgrestFilterBuilder<any, any, any, any> => {
  if (args.length < 2) return query;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return query;

  const field = fieldArg.field;
  const value = (valueArg as TQoreSearchRecordsValue).value;

  switch (operator) {
    case '==':
      return query.eq(field, value);
    case '!=':
      return query.neq(field, value);
    case '>':
      return query.gt(field, value);
    case '>=':
      return query.gte(field, value);
    case '<':
      return query.lt(field, value);
    case '<=':
      return query.lte(field, value);
    case 'like':
      if (typeof value !== 'string') return query;
      return query.like(field, value);
    case 'ilike':
      if (typeof value !== 'string') return query;
      return query.ilike(field, value);
    case 'in':
      const inValues = Array.isArray(value) ? value : [value];
      return query.in(field, inValues);
    case 'contains':
      const containsValues = Array.isArray(value) ? value : [value];
      return query.contains(field, containsValues);
    default:
      return query;
  }
};
