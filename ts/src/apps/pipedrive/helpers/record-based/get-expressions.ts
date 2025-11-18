import { TQoreSearchRecordsExpressions, EQoreExpressionGroups } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { PIPEDRIVE_APP_NAME } from '../../constants';

export const getPipedriveExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    PIPEDRIVE_APP_NAME,
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
      like: {
        type: 'operator',
        subtype: 'generic',
        name: 'like',
        symbol: 'like',
        roles: ['search'],
        group: EQoreExpressionGroups.DATA_MANIPULATION,
        args: [
          {
            type_code: 'field reference',
            type: 'string',
            label_after: 'like',
          },
          {
            type_code: 'value',
            type: 'string',
          },
        ],
        return_type: 'bool',
      },
      'is-null': {
        type: 'operator',
        subtype: 'generic',
        name: 'isNull',
        symbol: 'is-null',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
      'is-not-null': {
        type: 'operator',
        subtype: 'generic',
        name: 'isNotNull',
        symbol: 'is-not-null',
        roles: ['search'],
        group: EQoreExpressionGroups.COMPARISON,
        args: [
          {
            type_code: 'field reference',
            type: 'any',
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
