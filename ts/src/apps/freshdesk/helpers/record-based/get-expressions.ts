/**
 * Freshdesk Get Expressions
 *
 * Defines the supported filter expressions for Freshdesk record-based operations.
 * Server-side operators (==, >, >=, <, <=) are converted to Freshdesk query syntax.
 * Client-side operators (!=, contains, is-set, is-not-set) are applied after fetching.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { FRESHDESK_APP_NAME } from '../../constants';

/**
 * Get the supported expressions for Freshdesk record-based search operations.
 * Includes logical operators (AND, OR), comparison operators, and string operators.
 */
export const getFreshdeskExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    FRESHDESK_APP_NAME,
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

      // Comparison operators (server-side)
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

      // String operators (client-side)
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

      // Set operators (client-side)
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
    },
    locale
  );
};
