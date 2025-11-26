import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { getMondayBoardFields } from '../get-board-fields';

export type TMondayQueryRule = {
  column_id: string;
  compare_value: any[];
  operator?: string;
  compare_attribute?: string;
};

export type TMondayItemsQuery = {
  rules: TMondayQueryRule[];
  operator: 'and' | 'or';
  order_by?: {
    column_id: string;
    direction: string;
  };
};

const EXPRESSION_TO_MONDAY_OPERATOR: Record<string, string> = {
  '==': 'any_of',
  '!=': 'not_any_of',
  '>': 'greater_than',
  '>=': 'greater_than_or_equals',
  '<': 'lower_than',
  '<=': 'lower_than_or_equal',
  in: 'any_of',
  'not-in': 'not_any_of',
  'is-empty': 'is_empty',
  'is-not-empty': 'is_not_empty',
  between: 'between',
  'contains-text': 'contains_text',
  'not-contains-text': 'not_contains_text',
  'contains-terms': 'contains_terms',
  'starts-with': 'starts_with',
  'ends-with': 'ends_with',
  'within-the-next': 'within_the_next',
  'within-the-last': 'within_the_last',
};

export const buildMondayFilter = (
  where_cond: TQoreSearchRecordsWhereConditions
): TMondayItemsQuery => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&': {
      const rules: TMondayQueryRule[] = [];
      const orGroups: TQoreSearchRecordsWhereConditions[] = [];

      args.filter(isQoreRecordSearchExpression).forEach((arg) => {
        if (arg.exp === '||') {
          orGroups.push(arg);
        } else if (arg.exp === '&&') {
          const nestedQuery = buildMondayFilter(arg);
          rules.push(...nestedQuery.rules);
        } else {
          const rule = buildSingleRule(arg);
          if (rule) {
            rules.push(rule);
          }
        }
      });

      for (const orGroup of orGroups) {
        const mergedRule = tryMergeOrConditions(orGroup);
        if (mergedRule) {
          rules.push(mergedRule);
        } else {
          throw new Error(
            'Monday.com does not support OR conditions on different fields within AND. All OR conditions must be on the same field.'
          );
        }
      }

      return {
        rules,
        operator: 'and',
      };
    }

    case '||': {
      const rules: TMondayQueryRule[] = [];

      args.filter(isQoreRecordSearchExpression).forEach((arg) => {
        if (arg.exp === '||') {
          const nestedQuery = buildMondayFilter(arg);
          rules.push(...nestedQuery.rules);
        } else if (arg.exp === '&&') {
          throw new Error(
            'Monday.com does not support AND conditions within OR at the top level. Please restructure your query.'
          );
        } else {
          const rule = buildSingleRule(arg);
          if (rule) {
            rules.push(rule);
          }
        }
      });

      return {
        rules,
        operator: 'or',
      };
    }

    default: {
      const rule = buildSingleRule(where_cond);
      return {
        rules: rule ? [rule] : [],
        operator: 'and',
      };
    }
  }
};

const tryMergeOrConditions = (
  orCondition: TQoreSearchRecordsWhereConditions
): TMondayQueryRule | null => {
  const { args } = orCondition;

  const expressions = args.filter(isQoreRecordSearchExpression);
  if (expressions.length === 0) return null;

  let commonField: string | null = null;
  let commonOperator: string | null = null;
  const allValues: any[] = [];

  for (const expr of expressions) {
    if (expr.args.length < 1) return null;

    const fieldArg = expr.args[0];
    if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

    const field = fieldArg.field;
    const operator = EXPRESSION_TO_MONDAY_OPERATOR[expr.exp];

    if (!operator) return null;

    if (commonField === null) {
      commonField = field;
      commonOperator = operator;
    } else if (commonField !== field) {
      return null;
    } else if (commonOperator !== operator) {
      return null;
    }

    if (expr.args.length >= 2) {
      const valueArg = expr.args[1] as TQoreSearchRecordsValue;
      const value = valueArg.value;

      if (Array.isArray(value)) {
        allValues.push(...value);
      } else {
        allValues.push(value);
      }
    }
  }

  if (commonField && commonOperator) {
    return {
      column_id: commonField,
      compare_value: allValues,
      operator: commonOperator,
    };
  }

  return null;
};

const buildSingleRule = (expr: TQoreSearchRecordsWhereConditions): TMondayQueryRule | null => {
  const { exp, args } = expr;

  if (args.length < 1) return null;

  const fieldArg = args[0];
  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const column_id = fieldArg.field;

  const mondayOperator = EXPRESSION_TO_MONDAY_OPERATOR[exp];
  if (!mondayOperator) return null;

  if (exp === 'is-empty' || exp === 'is-not-empty') {
    return {
      column_id,
      compare_value: [],
      operator: mondayOperator,
    };
  }

  if (args.length < 2) return null;

  const valueArg = args[1] as TQoreSearchRecordsValue;
  let value = valueArg.value;

  if (exp === 'between' && args.length >= 3) {
    const lowValue = valueArg.value;
    const highValue = (args[2] as TQoreSearchRecordsValue).value;
    return {
      column_id,
      compare_value: [lowValue, highValue],
      operator: mondayOperator,
    };
  }

  if (exp === 'in' || exp === 'not-in' || exp === '==') {
    if (!Array.isArray(value)) {
      value = [value];
    }
    return {
      column_id,
      compare_value: value,
      operator: mondayOperator,
    };
  }

  if (
    exp === 'contains-text' ||
    exp === 'not-contains-text' ||
    exp === 'contains-terms' ||
    exp === 'starts-with' ||
    exp === 'ends-with'
  ) {
    return {
      column_id,
      compare_value: [String(value)],
      operator: mondayOperator,
    };
  }

  if (exp === 'within-the-next' || exp === 'within-the-last') {
    return {
      column_id,
      compare_value: [Number(value)],
      operator: mondayOperator,
    };
  }

  return {
    column_id,
    compare_value: [value],
    operator: mondayOperator,
  };
};

export const serializeMondayQueryParams = (queryParams: TMondayItemsQuery): string => {
  const serializeRule = (rule: TMondayQueryRule): string => {
    const parts: string[] = [];

    parts.push(`column_id: "${rule.column_id}"`);

    const serializedValues = rule.compare_value
      .map((val) => {
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'number') return Number(val);
        if (typeof val === 'boolean') return String(val);
        return JSON.stringify(val);
      })
      .join(', ');

    parts.push(`compare_value: [${serializedValues}]`);

    if (rule.operator) {
      parts.push(`operator: ${rule.operator}`);
    }

    if (rule.compare_attribute) {
      parts.push(`compare_attribute: "${rule.compare_attribute}"`);
    }

    return `{${parts.join(', ')}}`;
  };

  const serializedRules = queryParams.rules.map(serializeRule).join(', ');

  return `{rules: [${serializedRules}], operator: ${queryParams.operator}}`;
};

export const formatMondayQueryFieldValues = async (
  token: string,
  boardId: string,
  whereCondition: TQoreSearchRecordsWhereConditions
): Promise<TQoreSearchRecordsWhereConditions> => {
  const boardFields = await getMondayBoardFields(token, boardId);

  const formatCondition = (
    condition: TQoreSearchRecordsWhereConditions
  ): TQoreSearchRecordsWhereConditions => {
    const { exp, args } = condition;

    if (exp === '&&' || exp === '||') {
      return {
        exp,
        args: args.map((arg) => {
          if (isQoreRecordSearchExpression(arg)) {
            return formatCondition(arg);
          }
          return arg;
        }),
      };
    }

    if (args.length < 1) return condition;

    const fieldArg = args[0];
    if (!isQoreRecordSearchFieldReference(fieldArg)) return condition;

    const columnId = fieldArg.field;
    const field = boardFields[columnId];



    const labels = field?.settings?.labels || [];

    const formatValue = (value: any, exp?: string): any => {
      if (field.type === 'date' && exp !== 'between') {
        return new Date(value).getTime();
      }

      if (typeof value === 'string') {
        const matchingLabel = labels.find(
          (label) => label.label.toLowerCase() === value.toLowerCase()
        );
        return matchingLabel ? matchingLabel.id : value;
      }

      return value;
    };

    const newArgs = [...args];

    if (args.length >= 2) {
      const valueArg = args[1] as TQoreSearchRecordsValue;
      const value = valueArg.value;

      if (Array.isArray(value)) {
        newArgs[1] = {
          value: value.map((v) => formatValue(v, exp)),
        };
      } else {
        newArgs[1] = {
          value: formatValue(value, exp),
        };
      }
    }

    if (args.length >= 3 && exp === 'between') {
      const secondValueArg = args[2] as TQoreSearchRecordsValue;
      newArgs[2] = {
        value: formatValue(secondValueArg.value, exp),
      };
    }

    return {
      exp,
      args: newArgs,
    };
  };

  return formatCondition(whereCondition);
};
