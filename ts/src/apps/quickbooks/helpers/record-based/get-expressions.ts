/**
 * QuickBooks Get Expressions
 *
 * Defines the supported filter expressions for QuickBooks record-based operations.
 * Maps Qore expression operators to QuickBooks query language operators.
 *
 * NOTE: QuickBooks query language does NOT support OR or != operators.
 * These are handled via client-side filtering in apply-where-condition.ts.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { QUICKBOOKS_APP_NAME } from '../../constants';

/**
 * Get the supported expressions for QuickBooks record-based search operations.
 */
export const getQuickbooksExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    QUICKBOOKS_APP_NAME,
    {
      // Logical operators
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

      // Comparison operators
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

      // Set operators
      'is-set': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-set',
        symbol: 'isSet',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isSet',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      'is-not-set': {
        type: 'operator',
        subtype: 'generic',
        name: 'is-not-set',
        symbol: 'isNotSet',
        roles: ['search'],
        groups: [EQoreExpressionGroups.COMPARISON],
        args: [
          {
            type_code: 'field reference',
            label_after: 'isNotSet',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },

      // String operators
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
    },
    locale
  );
};
