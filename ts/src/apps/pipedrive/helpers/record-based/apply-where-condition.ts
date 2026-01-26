import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsValue,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

export type TPipedriveFilterCondition = {
  object: string;
  field_id: string;
  operator: string;
  value: any;
  extra_value?: any;
};

export type TPipedriveFilterGroup = {
  glue: 'and' | 'or';
  conditions: TPipedriveFilterCondition[];
};

export type TPipedriveFilterStructure = {
  glue: 'and';
  conditions: [TPipedriveFilterGroup, TPipedriveFilterGroup];
};

const OPERATOR_MAP: Record<string, string> = {
  '==': '=',
  '!=': '!=',
  '>': '>',
  '>=': '>=',
  '<': '<',
  '<=': '<=',
  like: "LIKE '$'",
  'is-null': 'IS NULL',
  'is-not-null': 'IS NOT NULL',
};

export const buildPipedriveFilter = (
  where_cond: TQoreSearchRecordsWhereConditions,
  objectType: string
): TPipedriveFilterStructure => {
  const { exp, args } = where_cond;

  if (exp === '&&') {
    const andConditions: TPipedriveFilterCondition[] = [];
    const orConditions: TPipedriveFilterCondition[] = [];

    args.filter(isQoreRecordSearchExpression).forEach((arg) => {
      if (arg.exp === '||') {
        arg.args.filter(isQoreRecordSearchExpression).forEach((orArg) => {
          const condition = buildSingleCondition(orArg, objectType);
          if (condition) {
            orConditions.push(condition);
          }
        });
      } else {
        const condition = buildSingleCondition(arg, objectType);
        if (condition) {
          andConditions.push(condition);
        }
      }
    });

    return {
      glue: 'and',
      conditions: [
        {
          glue: 'and',
          conditions: andConditions,
        },
        {
          glue: 'or',
          conditions: orConditions,
        },
      ],
    };
  }

  if (exp === '||') {
    const orConditions: TPipedriveFilterCondition[] = [];

    args.filter(isQoreRecordSearchExpression).forEach((arg) => {
      const condition = buildSingleCondition(arg, objectType);
      if (condition) {
        orConditions.push(condition);
      }
    });

    return {
      glue: 'and',
      conditions: [
        {
          glue: 'and',
          conditions: [],
        },
        {
          glue: 'or',
          conditions: orConditions,
        },
      ],
    };
  }

  const condition = buildSingleCondition(where_cond, objectType);
  return {
    glue: 'and',
    conditions: [
      {
        glue: 'and',
        conditions: condition ? [condition] : [],
      },
      {
        glue: 'or',
        conditions: [],
      },
    ],
  };
};

export const mapPipedriveFieldNamesToIds = (
  whereConditions: TQoreSearchRecordsWhereConditions,
  fieldNameToIdMap: Record<string, string>
): TQoreSearchRecordsWhereConditions => {
  const { args } = whereConditions;

  if (!args || args.length === 0) {
    return whereConditions;
  }

  const mappedArgs = args.map((arg) => {
    if (isQoreRecordSearchExpression(arg)) {
      return mapPipedriveFieldNamesToIds(arg, fieldNameToIdMap);
    }

    if (isQoreRecordSearchFieldReference(arg)) {
      const fieldId = fieldNameToIdMap[arg.field];
      return {
        ...arg,
        field: fieldId || arg.field,
      };
    }

    return arg;
  });

  return {
    ...whereConditions,
    args: mappedArgs,
  };
};

const buildSingleCondition = (
  expr: TQoreSearchRecordsWhereConditions,
  objectType: string
): TPipedriveFilterCondition | null => {
  const { exp, args } = expr;

  if (exp === 'is-null' || exp === 'is-not-null') {
    if (args.length < 1) return null;

    const fieldArg = args[0];
    if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

    const field = fieldArg.field;
    const operator = OPERATOR_MAP[exp];

    if (!operator) return null;

    return {
      object: objectType,
      field_id: field,
      operator,
      value: '',
    };
  }

  if (args.length < 2) return null;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return null;

  const field = fieldArg.field;
  const value = (valueArg as TQoreSearchRecordsValue).value;
  const operator = OPERATOR_MAP[exp];

  if (!operator) return null;

  const formattedValue = formatValue(value);

  return {
    object: objectType,
    field_id: field,
    operator,
    value: formattedValue,
  };
};

const formatValue = (value: any): any => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.split('T')[0];
    }
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return value;
};
