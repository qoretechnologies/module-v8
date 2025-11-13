import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../../../i18n/i18n-types';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME } from '../../constants';

export const getGoogleSheetsExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    GOOGLE_SHEETS_APP_NAME,
    {
      row_ids: {
        type: 'function',
        subtype: 'generic',
        name: 'row_ids',
        symbol: 'row_ids',
        group: EQoreExpressionGroups.COMPARISON,
        roles: ['search'],
        args: [
          {
            type_code: 'value',
            type: {
              type: 'list',
              element_type: 'int',
            },
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
