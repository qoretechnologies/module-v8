import { EQoreExpressionGroups, TQoreSearchRecordsExpressions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../../../i18n/i18n-types';
import { mapExpressionsToApp } from '../../../../global/helpers';
import { GITHUB_APP_NAME } from '../../constants';

export const getGitHubExpressions = (locale: Locales): TQoreSearchRecordsExpressions => {
  return mapExpressionsToApp(
    GITHUB_APP_NAME,
    {
      type: {
        type: 'function',
        subtype: 'generic',
        name: 'type',
        symbol: 'type',
        group: EQoreExpressionGroups.COMPARISON,
        roles: ['search'],
        args: [
          {
            type_code: 'value',
            type: 'string',
            allowed_values: [
              { value: 'public', display_name: 'Public Repos' },
              { value: 'private', display_name: 'Private Repos' },
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
