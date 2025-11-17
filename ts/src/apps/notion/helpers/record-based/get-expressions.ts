import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { NOTION_APP_NAME } from '../../constants';

export const getNotionExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    NOTION_APP_NAME,
    {
      '&&': {
        type: 'operator',
        subtype: 'logic-operator',
        name: '&&',
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
      '||': {
        type: 'operator',
        subtype: 'logic-operator',
        name: '||',
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
      '==': {
        type: 'operator',
        subtype: 'generic',
        name: '==',
        symbol: '==',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
            label_after: '==',
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
            label_after: '!=',
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
            label_after: '>=',
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
            label_after: '<',
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
            label_after: '<=',
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
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
            label_after: 'contains',
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
            label_after: 'in',
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

      'is-empty': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-empty',
        symbol: 'isEmpty',
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
      'is-not-empty': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-not-empty',
        symbol: 'isNotEmpty',
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
      'starts-with': {
        type: 'operator',
        subtype: 'generic',
        name: 'starts-with',
        symbol: 'startsWith',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'startsWith',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'ends-with': {
        type: 'operator',
        subtype: 'generic',
        name: 'ends-with',
        symbol: 'endsWith',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'endsWith',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'next-week': {
        type: 'operator',
        subtype: 'generic',
        name: 'next-week',
        symbol: 'nextWeek',
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
      'next-month': {
        type: 'operator',
        subtype: 'generic',
        name: 'next-month',
        symbol: 'nextMonth',
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
      'next-year': {
        type: 'operator',
        subtype: 'generic',
        name: 'next-year',
        symbol: 'nextYear',
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
      'past-week': {
        type: 'operator',
        subtype: 'generic',
        name: 'past-week',
        symbol: 'pastWeek',
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
      'past-month': {
        type: 'operator',
        subtype: 'generic',
        name: 'past-month',
        symbol: 'pastMonth',
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
      'past-year': {
        type: 'operator',
        subtype: 'generic',
        name: 'past-year',
        symbol: 'pastYear',
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
      'this-week': {
        type: 'operator',
        subtype: 'generic',
        name: 'this-week',
        symbol: 'thisWeek',
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
