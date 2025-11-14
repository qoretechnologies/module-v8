import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

type TBaserowFilter = {
  field: string;
  type: string;
  value?: any;
};

type TBaserowFilterGroup = {
  filter_type: 'AND' | 'OR';
  filters: TBaserowFilter[];
  groups: TBaserowFilterGroup[];
};

const EXPRESSION_KEY_TO_BASEROW_TYPE: Record<string, string> = {
  '==': 'equal',
  '!=': 'not_equal',
  '>': 'higher_than',
  '>=': 'higher_than_or_equal',
  '<': 'lower_than',
  '<=': 'lower_than_or_equal',
};

const kebabToSnake = (str: string): string => {
  return str.replace(/-/g, '_');
};

const getBaserowType = (exp: string): string => {
  if (EXPRESSION_KEY_TO_BASEROW_TYPE[exp]) {
    return EXPRESSION_KEY_TO_BASEROW_TYPE[exp];
  }

  return kebabToSnake(exp);
};

export const buildBaserowFilter = (
  where_cond: TQoreSearchRecordsWhereConditions
): TBaserowFilterGroup => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&':
    case '||': {
      const filterType = exp === '&&' ? 'AND' : 'OR';
      const filters: TBaserowFilter[] = [];
      const groups: TBaserowFilterGroup[] = [];

      args.filter(isQoreRecordSearchExpression).forEach((arg) => {
        if (arg.exp === '&&' || arg.exp === '||') {
          groups.push(buildBaserowFilter(arg));
        } else {
          const filter = buildSingleFilter(arg);
          if (filter) {
            filters.push(filter);
          }
        }
      });

      return {
        filter_type: filterType,
        filters,
        groups,
      };
    }

    default: {
      const filter = buildSingleFilter(where_cond);
      return {
        filter_type: 'AND',
        filters: filter ? [filter] : [],
        groups: [],
      };
    }
  }
};

const buildSingleFilter = (expr: TQoreSearchRecordsWhereConditions): TBaserowFilter | null => {
  const { exp, args } = expr;

  if (args.length < 1) return null;

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  const rawValue = (args[1] as TQoreSearchRecordsValue)?.value;

  const baserowType = getBaserowType(exp);

  const baseFilter: TBaserowFilter = {
    type: baserowType,
    field,
  };

  if (exp === 'not-empty' || exp === 'is-empty') {
    baseFilter.value = '';
  } else if (rawValue !== undefined) {
    if (typeof rawValue === 'boolean') {
      baseFilter.value = rawValue ? '1' : '';
    } else {
      baseFilter.value = rawValue;
    }
  }

  return baseFilter;
};
