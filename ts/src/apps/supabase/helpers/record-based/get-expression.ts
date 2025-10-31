import { TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { SUPABASE_APP_NAME } from '../../constants';

export const getSupabaseExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    SUPABASE_APP_NAME,
    {
      AND: {
        type: 'operator',
        subtype: 'logic-operator',
        name: 'AND',
        symbol: '&&',
        roles: ['search', 'field'],
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
        args: [
          {
            type_code: 'any',
            type: 'bool',
          },
        ],
        varargs: true,
        return_type: 'bool',
      },
      NOT: {
        type: 'operator',
        subtype: 'logic-operator',
        name: 'NOT',
        symbol: '!',
        roles: ['search', 'field'],
        args: [
          {
            type_code: 'any',
            type: 'bool',
          },
        ],
        return_type: 'bool',
      },
      '=': {
        type: 'operator',
        subtype: 'generic',
        name: '=',
        symbol: '=',
        roles: ['search'],
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
      like: {
        type: 'operator',
        subtype: 'generic',
        name: 'like',
        symbol: 'like',
        roles: ['search'],
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
      ilike: {
        type: 'operator',
        subtype: 'generic',
        name: 'ilike',
        symbol: 'ilike',
        roles: ['search'],
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
      in: {
        type: 'operator',
        subtype: 'generic',
        name: 'in',
        symbol: 'in',
        roles: ['search'],
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
      contains: {
        type: 'operator',
        subtype: 'generic',
        name: 'contains',
        symbol: '@>',
        roles: ['search'],
        args: [
          { type_code: 'field reference', type: { type: 'list', element_type: 'any' } },
          { type_code: 'value', type: { type: 'list', element_type: 'any' } },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
