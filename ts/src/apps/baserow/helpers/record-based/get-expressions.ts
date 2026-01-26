import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { BASEROW_APP_NAME } from '../../constants';

export const getBaserowExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    BASEROW_APP_NAME,
    {
      '&&': {
        type: 'operator',
        subtype: 'logic-operator',
        name: '&&',
        symbol: '&&',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.LOGICAL],
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
        groups: [EQoreExpressionGroups.LOGICAL],
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '==',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '!=',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '>',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'number',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '>=',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'number',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '<',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'number',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: '<=',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'number',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'contains',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'contains-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'contains-not',
        symbol: 'containsNot',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'containsNot',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'contains-word': {
        type: 'operator',
        subtype: 'generic',
        name: 'contains-word',
        symbol: 'containsWord',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'containsWord',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'doesnt-contain-word': {
        type: 'operator',
        subtype: 'generic',
        name: 'doesnt-contain-word',
        symbol: 'doesntContainWord',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntContainWord',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'length-is-lower-than': {
        type: 'operator',
        subtype: 'generic',
        name: 'length-is-lower-than',
        symbol: 'lengthIsLowerThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'lengthIsLowerThan',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      'empty': {
        type: 'operator',
        subtype: 'generic',
        name: 'empty',
        symbol: 'empty',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      'not-empty': {
        type: 'operator',
        subtype: 'generic',
        name: 'not-empty',
        symbol: 'isNotEmpty',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      'date-is': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is',
        symbol: 'dateIs',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIs',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-not',
        symbol: 'dateIsNot',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsNot',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-before',
        symbol: 'dateIsBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsBefore',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-on-or-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-on-or-before',
        symbol: 'dateIsOnOrBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsOnOrBefore',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-after',
        symbol: 'dateIsAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsAfter',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-on-or-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-on-or-after',
        symbol: 'dateIsOnOrAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsOnOrAfter',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-is-within': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-is-within',
        symbol: 'dateIsWithin',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dateIsWithin',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'date-equals-day-of-month': {
        type: 'operator',
        subtype: 'generic',
        name: 'date-equals-day-of-month',
        symbol: 'dayOfMonthIs',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'dayOfMonthIs',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      boolean: {
        type: 'operator',
        subtype: 'generic',
        name: 'boolean',
        symbol: 'is',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'is',
            type: 'bool',
          },
          {
            type_code: 'value',
            type: 'bool',
          },
        ],
        return_type: 'bool',
      },
      'is-even-and-whole': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-even-and-whole',
        symbol: 'isEvenAndWhole',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isEvenAndWhole',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'bool',
          },
        ],
        return_type: 'bool',
      },
      'single-select-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'single-select-equal',
        symbol: 'is',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'is',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'single-select-not-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'single-select-not-equal',
        symbol: 'isNot',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isNot',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'single-select-is-any-of': {
        type: 'operator',
        subtype: 'generic',
        name: 'single-select-is-any-of',
        symbol: 'isAnyOf',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
          },
          {
            type_code: 'value',
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
        ],
        return_type: 'bool',
      },
      'single-select-is-none-of': {
        type: 'operator',
        subtype: 'generic',
        name: 'single-select-is-none-of',
        symbol: 'isNoneOf',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
          },
          {
            type_code: 'value',
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
        ],
        return_type: 'bool',
      },
      'multiple-select-has': {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple-select-has',
        symbol: 'hasAnyOf',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'multiple-select-has-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple-select-has-not',
        symbol: 'doesntHaveAnyOf',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            type: {
              type: 'list',
              element_type: 'string',
            },
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'link-row-has': {
        type: 'operator',
        subtype: 'generic',
        name: 'link-row-has',
        symbol: 'has',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'has',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'link-row-has-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'link-row-has-not',
        symbol: 'doesntHave',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHave',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'link-row-contains': {
        type: 'operator',
        subtype: 'generic',
        name: 'link-row-contains',
        symbol: 'contains',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'contains',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'link-row-not-contains': {
        type: 'operator',
        subtype: 'generic',
        name: 'link-row-not-contains',
        symbol: 'doesntContain',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntContain',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'filename-contains': {
        type: 'operator',
        subtype: 'generic',
        name: 'filename-contains',
        symbol: 'filenameContains',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'filenameContains',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-file-type': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-file-type',
        symbol: 'hasFileType',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasFileType',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'files-lower-than': {
        type: 'operator',
        subtype: 'generic',
        name: 'files-lower-than',
        symbol: 'filesLowerThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'filesLowerThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      'user-is': {
        type: 'operator',
        subtype: 'generic',
        name: 'user-is',
        symbol: 'is',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'is',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'user-is-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'user-is-not',
        symbol: 'isNot',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isNot',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'multiple-collaborators-has': {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple-collaborators-has',
        symbol: 'has',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'has',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'multiple-collaborators-has-not': {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple-collaborators-has-not',
        symbol: 'doesntHave',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHave',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-empty-value': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-empty-value',
        symbol: 'hasEmptyValue',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasEmptyValue',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-empty-value': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-empty-value',
        symbol: 'doesntHaveEmptyValue',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveEmptyValue',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-value-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-equal',
        symbol: 'hasValueEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-equal',
        symbol: 'doesntHaveValueEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-value-contains': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-contains',
        symbol: 'hasValueContains',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueContains',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-contains': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-contains',
        symbol: 'doesntHaveValueContains',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueContains',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-value-contains-word': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-contains-word',
        symbol: 'hasValueContainsWord',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueContainsWord',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-contains-word': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-contains-word',
        symbol: 'doesntHaveValueContainsWord',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueContainsWord',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-value-length-is-lower-than': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-length-is-lower-than',
        symbol: 'hasValueLengthIsLowerThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueLengthIsLowerThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      'has-all-values-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-all-values-equal',
        symbol: 'hasAllValuesEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasAllValuesEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-any-select-option-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-any-select-option-equal',
        symbol: 'hasAnySelectOptionEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasAnySelectOptionEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-none-select-option-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-none-select-option-equal',
        symbol: 'doesntHaveSelectOptionEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveSelectOptionEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-value-higher': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-higher',
        symbol: 'hasValueHigherThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueHigherThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-higher': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-higher',
        symbol: 'doesntHaveValueHigherThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueHigherThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-value-higher-or-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-higher-or-equal',
        symbol: 'hasValueHigherThanOrEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueHigherThanOrEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-higher-or-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-higher-or-equal',
        symbol: 'doesntHaveValueHigherThanOrEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueHigherThanOrEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-value-lower': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-lower',
        symbol: 'hasValueLowerThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueLowerThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-lower': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-lower',
        symbol: 'doesntHaveValueLowerThan',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueLowerThan',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-value-lower-or-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-value-lower-or-equal',
        symbol: 'hasValueLowerThanOrEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasValueLowerThanOrEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-not-value-lower-or-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-value-lower-or-equal',
        symbol: 'doesntHaveValueLowerThanOrEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveValueLowerThanOrEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      'has-date-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-equal',
        symbol: 'hasDateEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-equal': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-equal',
        symbol: 'doesntHaveDateEqual',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateEqual',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-date-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-before',
        symbol: 'hasDateBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateBefore',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-before',
        symbol: 'doesntHaveDateBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateBefore',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-date-on-or-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-on-or-before',
        symbol: 'hasDateOnOrBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateOnOrBefore',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-on-or-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-on-or-before',
        symbol: 'doesntHaveDateOnOrBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateOnOrBefore',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-date-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-after',
        symbol: 'hasDateAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateAfter',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-after',
        symbol: 'doesntHaveDateAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateAfter',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-date-on-or-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-on-or-after',
        symbol: 'hasDateOnOrAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateOnOrAfter',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-on-or-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-on-or-after',
        symbol: 'doesntHaveDateOnOrAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateOnOrAfter',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-date-within': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-date-within',
        symbol: 'hasDateWithin',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'hasDateWithin',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'has-not-date-within': {
        type: 'operator',
        subtype: 'generic',
        name: 'has-not-date-within',
        symbol: 'doesntHaveDateWithin',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'doesntHaveDateWithin',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
