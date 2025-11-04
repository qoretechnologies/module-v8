import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { NOTION_APP_NAME } from '../../constants';

export const getNotionExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    NOTION_APP_NAME,
    {
      AND: {
        type: 'operator',
        subtype: 'logic-operator',
        name: 'AND',
        symbol: '&&',
        roles: ['search', 'field'],
        group: EQoreExpressionGroups.LOGICAL,
        args: [
          {
            type_code: 'any',
            type: 'bool',
          },
        ],
        varargs: true,
        return_type: 'bool',
      },
      OR: {
        type: 'operator',
        subtype: 'logic-operator',
        name: 'OR',
        symbol: '||',
        roles: ['search', 'field'],
        group: EQoreExpressionGroups.LOGICAL,
        args: [
          {
            type_code: 'any',
            type: 'bool',
          },
        ],
        varargs: true,
        return_type: 'bool',
      },
      '=': {
        type: 'operator',
        subtype: 'generic',
        name: '=',
        symbol: '=',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      '!=': {
        type: 'operator',
        subtype: 'generic',
        name: '!=',
        symbol: '!=',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      '>': {
        type: 'operator',
        subtype: 'generic',
        name: '>',
        symbol: '>',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      '>=': {
        type: 'operator',
        subtype: 'generic',
        name: '>=',
        symbol: '>=',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      '<': {
        type: 'operator',
        subtype: 'generic',
        name: '<',
        symbol: '<',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      '<=': {
        type: 'operator',
        subtype: 'generic',
        name: '<=',
        symbol: '<=',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'contains',
        symbol: 'contains',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },

      in: {
        type: 'operator',
        subtype: 'generic',
        name: 'in',
        symbol: 'in',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: {
              type: 'list',
              element_type: 'any',
            },
          },
        ],
        return_type: 'bool',
      },

      is_empty: {
        type: 'operator',
        subtype: 'generic',
        name: 'is_empty',
        symbol: 'is_empty',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      is_not_empty: {
        type: 'operator',
        subtype: 'generic',
        name: 'is_not_empty',
        symbol: 'is_not_empty',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },

      starts_with: {
        type: 'operator',
        subtype: 'generic',
        name: 'starts_with',
        symbol: 'starts_with',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      ends_with: {
        type: 'operator',
        subtype: 'generic',
        name: 'ends_with',
        symbol: 'ends_with',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      next_week: {
        type: 'operator',
        subtype: 'generic',
        name: 'next_week',
        symbol: 'next_week',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      next_month: {
        type: 'operator',
        subtype: 'generic',
        name: 'next_month',
        symbol: 'next_month',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      next_year: {
        type: 'operator',
        subtype: 'generic',
        name: 'next_year',
        symbol: 'next_year',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      past_week: {
        type: 'operator',
        subtype: 'generic',
        name: 'past_week',
        symbol: 'past_week',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      past_month: {
        type: 'operator',
        subtype: 'generic',
        name: 'past_month',
        symbol: 'past_month',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      past_year: {
        type: 'operator',
        subtype: 'generic',
        name: 'past_year',
        symbol: 'past_year',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
      this_week: {
        type: 'operator',
        subtype: 'generic',
        name: 'this_week',
        symbol: 'this_week',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
