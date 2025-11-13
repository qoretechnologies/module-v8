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
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
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
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
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
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
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
      contains_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'contains_not',
        symbol: "doesn't contain",
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
      contains_word: {
        type: 'operator',
        subtype: 'generic',
        name: 'contains_word',
        symbol: 'contains word',
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
      doesnt_contain_word: {
        type: 'operator',
        subtype: 'generic',
        name: 'doesnt_contain_word',
        symbol: "doesn't contain word",
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
      length_is_lower_than: {
        type: 'operator',
        subtype: 'generic',
        name: 'length_is_lower_than',
        symbol: 'length is lower than',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      empty: {
        type: 'operator',
        subtype: 'generic',
        name: 'empty',
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
      not_empty: {
        type: 'operator',
        subtype: 'generic',
        name: 'not_empty',
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
      date_is: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is',
        symbol: 'date is',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_not',
        symbol: 'date is not',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_before',
        symbol: 'date is before',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_on_or_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_on_or_before',
        symbol: 'date is on or before',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_after',
        symbol: 'date is after',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_on_or_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_on_or_after',
        symbol: 'date is on or after',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_is_within: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_is_within',
        symbol: 'date is within',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      date_equals_day_of_month: {
        type: 'operator',
        subtype: 'generic',
        name: 'date_equals_day_of_month',
        symbol: 'day of month is',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
        args: [
          {
            type_code: 'field reference',
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
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'bool',
          },
          {
            type_code: 'value',
            type: 'bool',
          },
        ],
        return_type: 'bool',
      },
      is_even_and_whole: {
        type: 'operator',
        subtype: 'generic',
        name: 'is_even_and_whole',
        symbol: 'is even and whole',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'number',
          },
          {
            type_code: 'value',
            type: 'bool',
          },
        ],
        return_type: 'bool',
      },
      single_select_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'single_select_equal',
        symbol: 'is',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      single_select_not_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'single_select_not_equal',
        symbol: 'is not',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      single_select_is_any_of: {
        type: 'operator',
        subtype: 'generic',
        name: 'single_select_is_any_of',
        symbol: 'is any of',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      single_select_is_none_of: {
        type: 'operator',
        subtype: 'generic',
        name: 'single_select_is_none_of',
        symbol: 'is none of',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      multiple_select_has: {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple_select_has',
        symbol: 'has any of',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
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
      multiple_select_has_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple_select_has_not',
        symbol: "doesn't have any of",
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
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
      link_row_has: {
        type: 'operator',
        subtype: 'generic',
        name: 'link_row_has',
        symbol: 'has',
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
      link_row_has_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'link_row_has_not',
        symbol: "doesn't have",
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
      link_row_contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'link_row_contains',
        symbol: 'contains',
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
      link_row_not_contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'link_row_not_contains',
        symbol: "doesn't contain",
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
      filename_contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'filename_contains',
        symbol: 'filename contains',
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
      has_file_type: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_file_type',
        symbol: 'has file type',
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
      files_lower_than: {
        type: 'operator',
        subtype: 'generic',
        name: 'files_lower_than',
        symbol: 'files lower than',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      user_is: {
        type: 'operator',
        subtype: 'generic',
        name: 'user_is',
        symbol: 'is',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      user_is_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'user_is_not',
        symbol: 'is not',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      multiple_collaborators_has: {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple_collaborators_has',
        symbol: 'has',
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
      multiple_collaborators_has_not: {
        type: 'operator',
        subtype: 'generic',
        name: 'multiple_collaborators_has_not',
        symbol: "doesn't have",
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
      has_empty_value: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_empty_value',
        symbol: 'has empty value',
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
      has_not_empty_value: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_empty_value',
        symbol: "doesn't have empty value",
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
      has_value_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_equal',
        symbol: 'has value equal',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      has_not_value_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_equal',
        symbol: "doesn't have value equal",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      has_value_contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_contains',
        symbol: 'has value contains',
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
      has_not_value_contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_contains',
        symbol: "doesn't have value contains",
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
      has_value_contains_word: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_contains_word',
        symbol: 'has value contains word',
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
      has_not_value_contains_word: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_contains_word',
        symbol: "doesn't have value contains word",
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
      has_value_length_is_lower_than: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_length_is_lower_than',
        symbol: 'has value length is lower than',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'int',
          },
        ],
        return_type: 'bool',
      },
      has_all_values_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_all_values_equal',
        symbol: 'has all values equal',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      has_any_select_option_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_any_select_option_equal',
        symbol: 'has any select option equal',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      has_none_select_option_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_none_select_option_equal',
        symbol: "doesn't have select option equal",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
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
      has_value_higher: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_higher',
        symbol: 'has value higher than',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_not_value_higher: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_higher',
        symbol: "doesn't have value higher than",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_value_higher_or_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_higher_or_equal',
        symbol: 'has value higher than or equal',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_not_value_higher_or_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_higher_or_equal',
        symbol: "doesn't have value higher than or equal",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_value_lower: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_lower',
        symbol: 'has value lower than',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_not_value_lower: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_lower',
        symbol: "doesn't have value lower than",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_value_lower_or_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_value_lower_or_equal',
        symbol: 'has value lower than or equal',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_not_value_lower_or_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_value_lower_or_equal',
        symbol: "doesn't have value lower than or equal",
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
          {
            type_code: 'value',
            type: 'number',
          },
        ],
        return_type: 'bool',
      },
      has_date_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_equal',
        symbol: 'has date equal',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_equal: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_equal',
        symbol: "doesn't have date equal",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_date_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_before',
        symbol: 'has date before',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_before',
        symbol: "doesn't have date before",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_date_on_or_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_on_or_before',
        symbol: 'has date on or before',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_on_or_before: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_on_or_before',
        symbol: "doesn't have date on or before",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_date_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_after',
        symbol: 'has date after',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_after',
        symbol: "doesn't have date after",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_date_on_or_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_on_or_after',
        symbol: 'has date on or after',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_on_or_after: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_on_or_after',
        symbol: "doesn't have date on or after",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_date_within: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_date_within',
        symbol: 'has date within',
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
      has_not_date_within: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_not_date_within',
        symbol: "doesn't have date within",
        roles: ['search'],
        group: EQoreExpressionGroups.DATE_TIME,
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
    },
    locale
  );
};
