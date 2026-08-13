import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { KLAVIYO_API_REVISION, KLAVIYO_APP_LOGO, KLAVIYO_APP_NAME } from './constants';

import * as KLAVIYO_ACTIONS from './actions';
import * as KLAVIYO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: KLAVIYO_APP_NAME,
    display_name: L[locale].apps[KLAVIYO_APP_NAME].displayName(),
    short_desc: L[locale].apps[KLAVIYO_APP_NAME].shortDesc(),
    desc: L[locale].apps[KLAVIYO_APP_NAME].longDesc(),
    logo: KLAVIYO_APP_LOGO,
    logo_file_name: 'klaviyo-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(KLAVIYO_APP_NAME, KLAVIYO_ACTIONS, locale),
      ...mapTriggersToApp(KLAVIYO_APP_NAME, KLAVIYO_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://a.klaviyo.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://www.klaviyo.com/oauth/authorize',
      oauth2_token_url: 'https://a.klaviyo.com/oauth/token',
      oauth2_token_use_basic_auth: true,
      oauth2_scopes: [
        'accounts:read',
        'metrics:read',
        'segments:read',
        'segments:write',
        'events:read',
        'events:write',
        'profiles:read',
        'profiles:write',
        'lists:read',
        'lists:write',
        'subscriptions:read',
        'subscriptions:write',
        'campaigns:read',
        'campaigns:write',
        'tags:read',
        'tags:write',
      ],
      ping_headers: {
        revision: KLAVIYO_API_REVISION,
      },
      oauth2_pkce: 'S256',
      ping_method: 'GET',
      ping_path: '/api/accounts',
    },
  }) satisfies TQoreAppWithActions;
