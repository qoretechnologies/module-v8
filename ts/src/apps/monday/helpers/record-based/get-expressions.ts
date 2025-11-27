import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { MONDAY_APP_NAME } from '../../constants';

export const getMondayExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    MONDAY_APP_NAME,
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
            label_after: '>',
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
      'not-in': {
        type: 'operator',
        subtype: 'generic',
        name: 'not-in',
        symbol: 'not in',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
            label_after: 'not in',
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
        symbol: 'is empty',
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
        symbol: 'is not empty',
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
      between: {
        type: 'operator',
        subtype: 'generic',
        name: 'between',
        symbol: 'between',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
            label_after: 'between',
          },
          {
            type_code: 'value',
            type: 'any',
            label_after: 'and',
          },
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      'contains-text': {
        type: 'operator',
        subtype: 'generic',
        name: 'contains-text',
        symbol: 'contains text',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'contains text',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'not-contains-text': {
        type: 'operator',
        subtype: 'generic',
        name: 'not-contains-text',
        symbol: 'not contains text',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'not contains text',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'contains-terms': {
        type: 'operator',
        subtype: 'generic',
        name: 'contains-terms',
        symbol: 'contains terms',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'contains terms',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'starts-with': {
        type: 'operator',
        subtype: 'generic',
        name: 'starts-with',
        symbol: 'starts with',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'starts with',
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
        symbol: 'ends with',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'ends with',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'within-the-next': {
        type: 'operator',
        subtype: 'generic',
        name: 'within-the-next',
        symbol: 'within the next',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
            label_after: 'within the next',
          },
          {
            type_code: 'value',
            type: 'int',
            display_name: 'Number of days',
            short_desc: 'Number of days to look ahead',
            desc: 'The number of days in the future to check',
            label_after: 'days',
          },
        ],
        return_type: 'bool',
      },
      'within-the-last': {
        type: 'operator',
        subtype: 'generic',
        name: 'within-the-last',
        symbol: 'within the last',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
            label_after: 'within the last',
          },
          {
            type_code: 'value',
            type: 'int',
            display_name: 'Number of days',
            short_desc: 'Number of days to look back',
            desc: 'The number of days in the past to check',
            label_after: 'days',
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
