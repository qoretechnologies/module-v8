import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

export type TAttioFilter = Record<string, any>;

export const buildAttioFilter = (where_cond: TQoreSearchRecordsWhereConditions): TAttioFilter => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&': {
      const conditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildAttioFilter(arg))
        .filter(Boolean);

      if (conditions.length === 0) return {};
      if (conditions.length === 1) return conditions[0];

      return { $and: conditions };
    }

    case '||': {
      const conditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildAttioFilter(arg))
        .filter(Boolean);

      if (conditions.length === 0) return {};
      if (conditions.length === 1) return conditions[0];

      return { $or: conditions };
    }

    case 'not': {
      if (args.length === 0 || !isQoreRecordSearchExpression(args[0])) return {};

      const innerFilter = buildAttioFilter(args[0]);
      if (!innerFilter || Object.keys(innerFilter).length === 0) return {};

      return { $not: innerFilter };
    }

    default:
      return buildSingleFilter(where_cond);
  }
};

const buildSingleFilter = (expr: TQoreSearchRecordsWhereConditions): TAttioFilter => {
  const { exp, args } = expr;

  if (args.length < 1) return {};

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) return {};

  const field = fieldArg.field === 'id' ? 'record_id' : fieldArg.field;

  const value = args[1] ? (args[1] as TQoreSearchRecordsValue).value : undefined;

  switch (exp) {
    case '==':
      return { [field]: { $eq: value } };
    case '!=':
      return { $not: { [field]: { $eq: value } } };
    case '>':
      return { [field]: { $gt: value } };
    case '>=':
      return { [field]: { $gte: value } };
    case '<':
      return { [field]: { $lt: value } };
    case '<=':
      return { [field]: { $lte: value } };
    case 'in':
      return { [field]: { $in: Array.isArray(value) ? value : [value] } };
    case 'contains':
      return { [field]: { $contains: value } };
    case 'not_contains':
      return { $not: { [field]: { $contains: value } } };
    case 'starts_with':
      return { [field]: { $starts_with: value } };
    case 'ends_with':
      return { [field]: { $ends_with: value } };
    case 'empty':
      return { [field]: { $empty: true } };
    case 'not_empty':
      return { [field]: { $not_empty: true } };
    default:
      return {};
  }
};
