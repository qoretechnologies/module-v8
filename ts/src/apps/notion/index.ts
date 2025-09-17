import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { NOTION_APP_LOGO, NOTION_APP_NAME } from './constants';

import * as NOTION_TRIGGERS from './triggers';
import * as NOTION_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    name: NOTION_APP_NAME,
    display_name: L[locale].apps[NOTION_APP_NAME].displayName(),
    short_desc: L[locale].apps[NOTION_APP_NAME].shortDesc(),
    desc: L[locale].apps[NOTION_APP_NAME].longDesc(),
    logo: NOTION_APP_LOGO,
    logo_file_name: 'notion-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(NOTION_APP_NAME, NOTION_ACTIONS, locale),
      ...mapTriggersToApp(NOTION_APP_NAME, NOTION_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.notion.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://api.notion.com/v1/oauth/authorize',
      oauth2_token_url: 'https://api.notion.com/v1/oauth/token',
      oauth2_scopes: ['read', 'write'],
      oauth2_auth_args: {
        owner: 'user',
      },
      ping_method: 'GET',
      ping_path: '/v1/users/me',
      ping_headers: {
        'Notion-Version': '2022-02-22',
      },
    },
  }) satisfies TQoreAppWithActions;
