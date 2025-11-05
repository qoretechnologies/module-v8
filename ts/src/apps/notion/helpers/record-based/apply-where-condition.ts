import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsWhereConditions,
  TQoreSearchRecordsValue,
} from '@qoretechnologies/ts-toolkit';
import { NotionError } from '../../constants';
import { omit } from 'lodash';

export const buildNotionFilter = (
  where_cond: TQoreSearchRecordsWhereConditions,
  properties: Record<string, any>
): any => {
  const { exp, args } = where_cond;

  switch (exp) {
    case '&&':
      const andConditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildNotionFilter(arg, properties))
        .filter(Boolean);

      if (andConditions.length === 0) return undefined;
      if (andConditions.length === 1) return andConditions[0];

      return { and: andConditions };

    case '||':
      const orConditions = args
        .filter(isQoreRecordSearchExpression)
        .map((arg) => buildNotionFilter(arg, properties))
        .filter(Boolean);

      if (orConditions.length === 0) return undefined;
      if (orConditions.length === 1) return orConditions[0];

      return { or: orConditions };

    case '==':
    case '!=':
    case '>':
    case '>=':
    case '<':
    case '<=':
    case 'in':
    case 'contains':
      return buildComparisonFilter(exp, args, properties);

    case 'is_empty':
    case 'is_not_empty':
      return buildEmptyFilter(exp, args, properties);

    case 'starts_with':
    case 'ends_with':
      return buildTextFilter(exp, args, properties);

    case 'next_week':
    case 'next_month':
    case 'next_year':
    case 'past_week':
    case 'past_month':
    case 'past_year':
    case 'this_week':
      return buildDateRelativeFilter(exp, args, properties);

    default:
      return undefined;
  }
};

const additionalProperties = {
  created_time: { type: 'created_time' },
  last_edited_time: { type: 'last_edited_time' },
};

const buildComparisonFilter = (
  operator: string,
  args: any[],
  properties: Record<string, any>
): any => {
  if (args.length < 2) return undefined;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return undefined;

  const field = fieldArg.field;
  const value = (valueArg as TQoreSearchRecordsValue).value;
  const propertyType = {
    ...properties,
    ...additionalProperties,
  }[field]?.type;

  if (!propertyType) {
    throw new NotionError(`Property "${field}" not found in data source`);
  }

  switch (operator) {
    case '==':
      return buildPropertyFilter(field, propertyType, 'equals', value);
    case '!=':
      return buildPropertyFilter(field, propertyType, 'does_not_equal', value);
    case '>':
      return buildPropertyFilter(field, propertyType, 'greater_than', value);
    case '>=':
      return buildPropertyFilter(field, propertyType, 'greater_than_or_equal_to', value);
    case '<':
      return buildPropertyFilter(field, propertyType, 'less_than', value);
    case '<=':
      return buildPropertyFilter(field, propertyType, 'less_than_or_equal_to', value);
    case 'in':
      if (!Array.isArray(value)) return undefined;
      const inConditions = value.map((v) => buildPropertyFilter(field, propertyType, 'equals', v));
      return inConditions.length === 1 ? inConditions[0] : { or: inConditions };
    case 'contains':
      return buildPropertyFilter(field, propertyType, 'contains', value);
    default:
      return undefined;
  }
};

const buildPropertyFilter = (
  property: string,
  propertyType: string,
  condition: string,
  value: TQoreSearchRecordsValue['value']
): any => {
  switch (propertyType) {
    case 'checkbox':
      return {
        property,
        checkbox: {
          [condition]: Boolean(value),
        },
      };
    case 'created_time':
      return {
        timestamp: property,
        created_time: {
          [mapDateCondition(condition)]: String(value),
        },
      };
    case 'last_edited_time':
      return {
        timestamp: property,
        last_edited_time: {
          [mapDateCondition(condition)]: String(value),
        },
      };

    case 'date':
      return {
        property,
        date: {
          [mapDateCondition(condition)]: String(value),
        },
      };

    case 'number':
      return {
        property,
        number: {
          [mapNumberCondition(condition)]: Number(value),
        },
      };

    case 'select':
      return {
        property,
        select: {
          [condition]: String(value),
        },
      };

    case 'multi_select':
      return {
        property,
        multi_select: {
          [condition]: String(value),
        },
      };

    case 'status':
      return {
        property,
        status: {
          [condition]: String(value),
        },
      };

    case 'rich_text':
    case 'title':
      return {
        property,
        [propertyType]: {
          [mapTextCondition(condition)]: String(value),
        },
      };

    case 'email':
      return {
        property,
        email: {
          [mapTextCondition(condition)]: String(value),
        },
      };

    case 'phone_number':
      return {
        property,
        phone_number: {
          [mapTextCondition(condition)]: String(value),
        },
      };

    case 'url':
      return {
        property,
        url: {
          [mapTextCondition(condition)]: String(value),
        },
      };

    case 'people':
    case 'created_by':
    case 'last_edited_by':
      return {
        property,
        people: {
          [condition]: String(value),
        },
      };

    case 'relation':
      return {
        property,
        relation: {
          [condition]: String(value),
        },
      };

    case 'unique_id':
      return {
        property,
        unique_id: {
          [mapNumberCondition(condition)]: Number(value),
        },
      };

    default:
      throw new NotionError(`Unsupported property type for filtering: ${propertyType}`);
  }
};

const mapDateCondition = (condition: string): string => {
  const mapping: Record<string, string> = {
    equals: 'equals',
    does_not_equal: 'does_not_equal',
    greater_than: 'after',
    greater_than_or_equal_to: 'on_or_after',
    less_than: 'before',
    less_than_or_equal_to: 'on_or_before',
  };
  return mapping[condition] || condition;
};

const mapNumberCondition = (condition: string): string => {
  const mapping: Record<string, string> = {
    equals: 'equals',
    does_not_equal: 'does_not_equal',
    greater_than: 'greater_than',
    greater_than_or_equal_to: 'greater_than_or_equal_to',
    less_than: 'less_than',
    less_than_or_equal_to: 'less_than_or_equal_to',
  };
  return mapping[condition] || condition;
};

const mapTextCondition = (condition: string): string => {
  const mapping: Record<string, string> = {
    equals: 'equals',
    does_not_equal: 'does_not_equal',
    contains: 'contains',
    does_not_contain: 'does_not_contain',
  };
  return mapping[condition] || condition;
};

const buildEmptyFilter = (operator: string, args: any[], properties: Record<string, any>): any => {
  if (args.length < 1) return undefined;

  const fieldArg = args[0];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return undefined;

  const field = fieldArg.field;
  const propertyType = properties[field]?.type;

  if (!propertyType) {
    throw new NotionError(`Property "${field}" not found in data source`);
  }

  const filterKey = getFilterKeyForPropertyType(propertyType);

  return {
    property: field,
    [filterKey]: {
      [operator]: true,
    },
  };
};

const buildTextFilter = (operator: string, args: any[], properties: Record<string, any>): any => {
  if (args.length < 2) return undefined;

  const fieldArg = args[0];
  const valueArg = args[1];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return undefined;

  const field = fieldArg.field;
  const value = (valueArg as TQoreSearchRecordsValue).value;
  const propertyType = {
    ...properties,
    ...additionalProperties,
  }[field]?.type;

  if (!propertyType) {
    throw new NotionError(`Property "${field}" not found in data source`);
  }

  const textProperties = ['rich_text', 'title', 'email', 'phone_number', 'url'];

  if (!textProperties.includes(propertyType)) {
    throw new NotionError(
      `Operator "${operator}" only works with text properties, but "${field}" is type "${propertyType}"`
    );
  }

  return {
    property: field,
    [propertyType]: {
      [operator]: String(value),
    },
  };
};

const buildDateRelativeFilter = (
  operator: string,
  args: any[],
  properties: Record<string, any>
): any => {
  if (args.length < 1) return undefined;

  const fieldArg = args[0];

  if (!isQoreRecordSearchFieldReference(fieldArg)) return undefined;

  const field = fieldArg.field;
  const propertyType = {
    ...properties,
    ...omit(additionalProperties, 'id'),
  }[field]?.type;

  if (!propertyType) {
    throw new NotionError(`Property "${field}" not found in data source`);
  }

  const dateProperties = ['date', 'created_time', 'last_edited_time'];

  if (!dateProperties.includes(propertyType)) {
    throw new NotionError(
      `Operator "${operator}" only works with date properties, but "${field}" is type "${propertyType}"`
    );
  }

  return {
    property: field,
    date: {
      [operator]: {},
    },
  };
};

const getFilterKeyForPropertyType = (propertyType: string): string => {
  if (propertyType === 'created_by' || propertyType === 'last_edited_by') {
    return 'people';
  }
  if (propertyType === 'created_time' || propertyType === 'last_edited_time') {
    return 'date';
  }
  return propertyType;
};
