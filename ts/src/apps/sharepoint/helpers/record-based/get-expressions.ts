/**
 * SharePoint Get Expressions
 *
 * Defines the supported filter expressions for SharePoint record-based operations.
 * Maps Qore expression operators to Microsoft Graph OData filter operators.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { SHAREPOINT_APP_NAME } from '../../constants';

/**
 * Get the supported expressions for SharePoint record-based search operations.
 * Includes logical operators (AND, OR) and comparison operators supported by OData.
 */
export const getSharePointExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    SHAREPOINT_APP_NAME,
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
