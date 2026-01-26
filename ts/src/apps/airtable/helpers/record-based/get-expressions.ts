import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { AIRTABLE_APP_NAME } from '../../constants';

export const getAirtableExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    AIRTABLE_APP_NAME,
    {
      // ==================== LOGICAL OPERATORS ====================
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
      not: {
        type: 'function',
        subtype: 'generic',
        name: 'not',
        symbol: 'NOT',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.LOGICAL],
        args: [
          {
            type_code: 'any',
            type: 'bool',
            label_before: 'NOT',
          },
        ],
        return_type: 'bool',
      },
      xor: {
        type: 'function',
        subtype: 'generic',
        name: 'xor',
        symbol: 'XOR',
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

      // ==================== COMPARISON OPERATORS ====================
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

      // ==================== STRING OPERATORS ====================
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
      'starts-with': {
        type: 'operator',
        subtype: 'generic',
        name: 'starts-with',
        symbol: 'startsWith',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'startsWith',
            type: 'string',
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
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'endsWith',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'regex-match': {
        type: 'function',
        subtype: 'generic',
        name: 'regex-match',
        symbol: 'REGEX_MATCH',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'matches regex',
            type: 'string',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },

      // ==================== NULL CHECK OPERATORS ====================
      empty: {
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

      // ==================== DATE/TIME OPERATORS ====================
      'is-before': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-before',
        symbol: 'isBefore',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isBefore',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'is-after': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-after',
        symbol: 'isAfter',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isAfter',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'is-same': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-same',
        symbol: 'isSame',
        roles: ['search'],
        groups: [EQoreExpressionGroups.DATE_TIME],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isSame',
            type: 'date',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },

      // ==================== BOOLEAN OPERATORS ====================
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

      // ==================== STRING FUNCTIONS ====================
      find: {
        type: 'function',
        subtype: 'generic',
        name: 'find',
        symbol: 'FIND',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'value',
            type: 'string',
            label_before: 'FIND(',
            label_after: ',',
          },
          {
            type_code: 'field reference',
            type: 'string',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      search: {
        type: 'function',
        subtype: 'generic',
        name: 'search',
        symbol: 'SEARCH',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'value',
            type: 'string',
            label_before: 'SEARCH(',
            label_after: ',',
          },
          {
            type_code: 'field reference',
            type: 'string',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      len: {
        type: 'function',
        subtype: 'generic',
        name: 'len',
        symbol: 'LEN',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_before: 'LEN(',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      lower: {
        type: 'function',
        subtype: 'generic',
        name: 'lower',
        symbol: 'LOWER',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_before: 'LOWER(',
            label_after: ')',
          },
        ],
        return_type: 'string',
      },
      upper: {
        type: 'function',
        subtype: 'generic',
        name: 'upper',
        symbol: 'UPPER',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_before: 'UPPER(',
            label_after: ')',
          },
        ],
        return_type: 'string',
      },
      trim: {
        type: 'function',
        subtype: 'generic',
        name: 'trim',
        symbol: 'TRIM',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_before: 'TRIM(',
            label_after: ')',
          },
        ],
        return_type: 'string',
      },

      // ==================== NUMERIC FUNCTIONS ====================
      abs: {
        type: 'function',
        subtype: 'generic',
        name: 'abs',
        symbol: 'ABS',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
            label_before: 'ABS(',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      round: {
        type: 'function',
        subtype: 'generic',
        name: 'round',
        symbol: 'ROUND',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
            label_before: 'ROUND(',
            label_after: ',',
          },
          {
            type_code: 'value',
            type: 'number',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      floor: {
        type: 'function',
        subtype: 'generic',
        name: 'floor',
        symbol: 'FLOOR',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
            label_before: 'FLOOR(',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      ceiling: {
        type: 'function',
        subtype: 'generic',
        name: 'ceiling',
        symbol: 'CEILING',
        roles: ['field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
            label_before: 'CEILING(',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },
      mod: {
        type: 'function',
        subtype: 'generic',
        name: 'mod',
        symbol: 'MOD',
        roles: ['search', 'field'],
        groups: [EQoreExpressionGroups.DATA_MANIPULATION],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
            label_before: 'MOD(',
            label_after: ',',
          },
          {
            type_code: 'value',
            type: 'number',
            label_after: ')',
          },
        ],
        return_type: 'number',
      },

      // ==================== CONDITIONAL FUNCTIONS ====================
      if: {
        type: 'function',
        subtype: 'generic',
        name: 'if',
        symbol: 'IF',
        roles: ['field'],
        groups: [EQoreExpressionGroups.LOGICAL],
        args: [
          {
            type_code: 'any',
            type: 'bool',
            label_before: 'IF(',
            label_after: ',',
          },
          {
            type_code: 'value',
            type: 'any',
            label_after: ',',
          },
          {
            type_code: 'value',
            type: 'any',
            label_after: ')',
          },
        ],
        return_type: 'any',
      },

      // ==================== AGGREGATE FUNCTIONS ====================
      sum: {
        type: 'function',
        subtype: 'generic',
        name: 'sum',
        symbol: 'SUM',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
      average: {
        type: 'function',
        subtype: 'generic',
        name: 'average',
        symbol: 'AVERAGE',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
      min: {
        type: 'function',
        subtype: 'generic',
        name: 'min',
        symbol: 'MIN',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
      max: {
        type: 'function',
        subtype: 'generic',
        name: 'max',
        symbol: 'MAX',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'field reference',
            type: 'number',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
      count: {
        type: 'function',
        subtype: 'generic',
        name: 'count',
        symbol: 'COUNT',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'any',
            type: 'any',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
      counta: {
        type: 'function',
        subtype: 'generic',
        name: 'counta',
        symbol: 'COUNTA',
        roles: ['field'],
        groups: [EQoreExpressionGroups.AGGREGATE],
        args: [
          {
            type_code: 'any',
            type: 'any',
          },
        ],
        varargs: true,
        return_type: 'number',
      },
    },
    locale
  );
};
