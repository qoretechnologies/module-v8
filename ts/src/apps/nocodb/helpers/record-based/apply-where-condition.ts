import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

/**
 * Maps Qore expression operators to NocoDB filter operators
 */
const EXPRESSION_KEY_TO_NOCODB_TYPE: Record<string, string> = {
  '==': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  'contains': 'like',
  'not-contains': 'nlike',
  'contains-word': 'like',
  'empty': 'empty',
  'not-empty': 'notempty',
  'is-null': 'null',
  'is-not-null': 'notnull',
};

const kebabToNocoDB = (str: string): string => {
  // Convert kebab-case to NocoDB operator names
  const mapping: Record<string, string> = {
    'not-empty': 'notempty',
    'is-null': 'null',
    'is-not-null': 'notnull',
    'not-contains': 'nlike',
  };

  return mapping[str] || str;
};

const getNocoDBOperator = (exp: string): string => {
  if (EXPRESSION_KEY_TO_NOCODB_TYPE[exp]) {
    return EXPRESSION_KEY_TO_NOCODB_TYPE[exp];
  }

  return kebabToNocoDB(exp);
};

/**
 * Builds a NocoDB filter string from Qore search conditions
 * NocoDB filter format: (field,operator,value)~and(field2,operator2,value2)
 * Logical operators: ~and, ~or, ~not
 */
export const buildNocoDBFilter = (where_cond: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&':
    case '||': {
      const logicalOp = exp === '&&' ? '~and' : '~or';
      const conditions: string[] = [];

      args.filter(isQoreRecordSearchExpression).forEach((arg) => {
        const filterStr = buildNocoDBFilter(arg);
        if (filterStr) {
          conditions.push(filterStr);
        }
      });

      return conditions.join(logicalOp);
    }

    default: {
      return buildSingleFilter(where_cond) || '';
    }
  }
};

const buildSingleFilter = (expr: TQoreSearchRecordsWhereConditions): string | null => {
  const { exp, args } = expr;

  if (args.length < 1) return null;

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  const rawValue = (args[1] as TQoreSearchRecordsValue)?.value;

  const nocodbOperator = getNocoDBOperator(exp);

  // NocoDB format: (field,operator,value)
  // For empty/null checks, value might not be needed
  if (exp === 'empty' || exp === 'not-empty' || exp === 'is-null' || exp === 'is-not-null') {
    return `(${field},${nocodbOperator})`;
  }

  if (rawValue === undefined) {
    return `(${field},${nocodbOperator})`;
  }

  // Convert value to string format
  let valueStr: string;
  if (typeof rawValue === 'boolean') {
    valueStr = rawValue ? 'true' : 'false';
  } else if (typeof rawValue === 'string') {
    // Escape commas and parentheses in string values
    valueStr = String(rawValue).replace(/,/g, '\\,').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  } else {
    valueStr = String(rawValue);
  }

  return `(${field},${nocodbOperator},${valueStr})`;
};
