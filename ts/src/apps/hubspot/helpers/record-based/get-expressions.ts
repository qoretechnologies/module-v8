import { TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { HUBSPOT_APP_NAME } from '../../constants';

export const getHubspotExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    HUBSPOT_APP_NAME,
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
      not_in: {
        type: 'operator',
        subtype: 'generic',
        name: 'not_in',
        symbol: 'not in',
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
      between: {
        type: 'operator',
        subtype: 'generic',
        name: 'between',
        symbol: 'between',
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
          {
            type_code: 'value',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      has_property: {
        type: 'operator',
        subtype: 'generic',
        name: 'has_property',
        symbol: 'has property',
        roles: ['search'],
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      not_has_property: {
        type: 'operator',
        subtype: 'generic',
        name: 'not_has_property',
        symbol: 'does not have property',
        roles: ['search'],
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      contains_token: {
        type: 'operator',
        subtype: 'generic',
        name: 'contains_token',
        symbol: 'contains token',
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
      not_contains_token: {
        type: 'operator',
        subtype: 'generic',
        name: 'not_contains_token',
        symbol: 'does not contain token',
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
    },
    locale
  );
};
