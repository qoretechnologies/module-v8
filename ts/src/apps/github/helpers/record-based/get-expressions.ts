import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { Locales } from '../../../../i18n/i18n-types';
import { GITHUB_APP_NAME } from '../../constants';

export const getGitHubExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    GITHUB_APP_NAME,
    {
      state: {
        type: 'function',
        subtype: 'generic',
        name: 'state',
        symbol: 'state',
        groups: [EQoreExpressionGroups.COMPARISON],
        roles: ['search'],
        args: [
          {
            type_code: 'value',
            type: 'string',
            allowed_values: [
              { value: 'open', display_name: 'Open' },
              { value: 'closed', display_name: 'Closed' },
              { value: 'all', display_name: 'All' },
            ],
            allowed_values_creatable: true,
          },
        ],
        return_type: 'bool',
      },
    },
    locale
  );
};
