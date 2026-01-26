import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { ACTIVE_DIRECTORY_APP_LOGO, ACTIVE_DIRECTORY_APP_NAME } from './constants';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import { Locales } from '../../i18n/i18n-types';

import * as ACTIVE_DIRECTORY_ACTIONS from './actions';
import * as ACTIVE_DIRECTORY_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[ACTIVE_DIRECTORY_APP_NAME].displayName(),
    short_desc: L[locale].apps[ACTIVE_DIRECTORY_APP_NAME].shortDesc(),
    desc: L[locale].apps[ACTIVE_DIRECTORY_APP_NAME].longDesc(),
    name: ACTIVE_DIRECTORY_APP_NAME,
    actions: [
      ...mapActionsToApp(ACTIVE_DIRECTORY_APP_NAME, ACTIVE_DIRECTORY_ACTIONS, locale),
      ...mapTriggersToApp(ACTIVE_DIRECTORY_APP_NAME, ACTIVE_DIRECTORY_TRIGGERS, locale),
    ],
    logo: ACTIVE_DIRECTORY_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',

    rest: {
      url: 'https://graph.microsoft.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      oauth2_scopes: [
        'offline_access',
        'User.ReadWrite.All',
        'GroupMember.ReadWrite.All',
        'Group.ReadWrite.All',
        'Directory.ReadWrite.All',
      ],
      ping_path: '/v1.0/me',
      ping_method: 'GET',
    },
  }) satisfies TQoreAppWithActions;
