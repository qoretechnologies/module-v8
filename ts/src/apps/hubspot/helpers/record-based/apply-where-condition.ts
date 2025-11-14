import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreRecordSearchValue,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

export type THubspotFilter = {
  propertyName: string;
  operator: string;
  value?: any;
  values?: any[];
  highValue?: any;
};

export type THubspotFilterGroup = {
  filters: THubspotFilter[];
};

export const buildHubspotFilter = (
  where_cond: TQoreSearchRecordsWhereConditions
): THubspotFilterGroup[] => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&': {
      const hasOrExpression = args.some(
        (arg) => isQoreRecordSearchExpression(arg) && arg.exp === '||'
      );

      if (hasOrExpression) {
        return expandOrInAnd(args);
      }

      const filters: THubspotFilter[] = [];

      for (const arg of args) {
        if (isQoreRecordSearchExpression(arg)) {
          if (arg.exp === '&&') {
            const nestedGroups = buildHubspotFilter(arg);
            if (nestedGroups.length > 0) {
              filters.push(...nestedGroups[0].filters);
            }
          } else {
            const filter = buildSingleFilter(arg);
            if (filter) {
              filters.push(filter);
            }
          }
        }
      }

      return filters.length > 0 ? [{ filters }] : [];
    }

    case '||': {
      const filterGroups: THubspotFilterGroup[] = [];

      for (const arg of args) {
        if (isQoreRecordSearchExpression(arg)) {
          if (arg.exp === '&&') {
            const andFilters: THubspotFilter[] = [];

            for (const andArg of arg.args) {
              if (isQoreRecordSearchExpression(andArg)) {
                const filter = buildSingleFilter(andArg);
                if (filter) {
                  andFilters.push(filter);
                }
              }
            }

            if (andFilters.length > 0) {
              filterGroups.push({ filters: andFilters });
            }
          } else if (arg.exp === '||') {
            const nestedGroups = buildHubspotFilter(arg);
            filterGroups.push(...nestedGroups);
          } else {
            const filter = buildSingleFilter(arg);
            if (filter) {
              filterGroups.push({ filters: [filter] });
            }
          }
        }
      }

      return filterGroups;
    }

    default: {
      const filter = buildSingleFilter(where_cond);
      return filter ? [{ filters: [filter] }] : [];
    }
  }
};

const expandOrInAnd = (args: Array<TQoreRecordSearchValue>): THubspotFilterGroup[] => {
  const orExpressions: TQoreSearchRecordsWhereConditions[] = [];
  const otherConditions: TQoreSearchRecordsWhereConditions[] = [];

  for (const arg of args) {
    if (isQoreRecordSearchExpression(arg)) {
      if (arg.exp === '||') {
        orExpressions.push(arg);
      } else {
        otherConditions.push(arg);
      }
    }
  }

  if (orExpressions.length === 0) {
    const filters = otherConditions.map(buildSingleFilter).filter(Boolean) as THubspotFilter[];
    return filters.length > 0 ? [{ filters }] : [];
  }

  const filterGroups: THubspotFilterGroup[] = [];
  const orGroups = buildHubspotFilter(orExpressions[0]);

  for (const orGroup of orGroups) {
    const combinedFilters = [...orGroup.filters];

    for (const condition of otherConditions) {
      const filter = buildSingleFilter(condition);
      if (filter) {
        combinedFilters.push(filter);
      }
    }

    filterGroups.push({ filters: combinedFilters });
  }

  return filterGroups;
};

const buildSingleFilter = (expr: TQoreSearchRecordsWhereConditions): THubspotFilter | null => {
  const { exp, args } = expr;

  switch (exp) {
    case '==':
      return buildComparisonFilter('EQ', args);
    case '!=':
      return buildComparisonFilter('NEQ', args);
    case '>':
      return buildComparisonFilter('GT', args);
    case '>=':
      return buildComparisonFilter('GTE', args);
    case '<':
      return buildComparisonFilter('LT', args);
    case '<=':
      return buildComparisonFilter('LTE', args);
    case 'in':
      return buildInFilter('IN', args);
    case 'not-in':
      return buildInFilter('NOT_IN', args);
    case 'between':
      return buildBetweenFilter(args);
    case 'has-property':
      return buildPropertyFilter('HAS_PROPERTY', args);
    case 'not-has-property':
      return buildPropertyFilter('NOT_HAS_PROPERTY', args);
    case 'contains-token':
      return buildComparisonFilter('CONTAINS_TOKEN', args);
    case 'not-contains-token':
      return buildComparisonFilter('NOT_CONTAINS_TOKEN', args);
    default:
      return null;
  }
};

const buildComparisonFilter = (
  operator: string,
  args: Array<TQoreRecordSearchValue>
): THubspotFilter | null => {
  if (args.length < 2) return null;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  const value = (valueArg as TQoreSearchRecordsValue).value;

  return {
    propertyName: field,
    operator,
    value: convertValueForHubspot(value),
  };
};

const buildInFilter = (
  operator: 'IN' | 'NOT_IN',
  args: Array<TQoreRecordSearchValue>
): THubspotFilter | null => {
  if (args.length < 2) return null;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  let values = (valueArg as TQoreSearchRecordsValue).value;

  if (!Array.isArray(values)) {
    values = [values];
  }

  const convertedValues = values.map((v: any) => {
    if (typeof v === 'string') {
      return v.toLowerCase();
    }
    return v;
  });

  return {
    propertyName: field,
    operator,
    values: convertedValues,
  };
};

const buildBetweenFilter = (args: Array<TQoreRecordSearchValue>): THubspotFilter | null => {
  if (args.length < 3) return null;

  const fieldArg = args[0];
  const lowValueArg = args[1];
  const highValueArg = args[2];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  const lowValue = (lowValueArg as TQoreSearchRecordsValue).value;
  const highValue = (highValueArg as TQoreSearchRecordsValue).value;

  return {
    propertyName: field,
    operator: 'BETWEEN',
    value: convertValueForHubspot(lowValue),
    highValue: convertValueForHubspot(highValue),
  };
};

const buildPropertyFilter = (
  operator: 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY',
  args: Array<TQoreRecordSearchValue>
): THubspotFilter | null => {
  if (args.length < 1) return null;

  const fieldArg = args[0];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  return {
    propertyName: fieldArg.field,
    operator,
  };
};

const convertValueForHubspot = (value: any): any => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.getTime();
      }
    }
    return value.toLowerCase();
  }

  return value;
};
