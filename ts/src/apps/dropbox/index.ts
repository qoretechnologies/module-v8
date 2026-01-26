import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { DROPBOX_API_URL, DROPBOX_APP_LOGO, DROPBOX_APP_NAME } from './constants';

import * as DROPBOX_ACTIONS from './actions';
import * as DROPBOX_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: DROPBOX_APP_NAME,
    display_name: L[locale].apps[DROPBOX_APP_NAME].displayName(),
    short_desc: L[locale].apps[DROPBOX_APP_NAME].shortDesc(),
    desc: L[locale].apps[DROPBOX_APP_NAME].longDesc(),
    logo: DROPBOX_APP_LOGO,
    logo_file_name: 'dropbox-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(DROPBOX_APP_NAME, DROPBOX_ACTIONS, locale),
      ...mapTriggersToApp(DROPBOX_APP_NAME, DROPBOX_TRIGGERS, locale),
    ],
    rest: {
      url: DROPBOX_API_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://www.dropbox.com/oauth2/authorize',
      oauth2_token_url: 'https://api.dropboxapi.com/oauth2/token',
      ping_method: 'POST',
      ping_path: '/2/check/user',
      ping_body: { query: 'val' },
      oauth2_scopes: [
        'files.metadata.write',
        'files.metadata.read',
        'files.content.write',
        'files.content.read',
        'sharing.write',
        'sharing.read',
        'account_info.read',
      ],
      oauth2_auth_args: {
        token_access_type: 'offline',
      },
    },
  }) satisfies TQoreAppWithActions;
