import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { PATREON_APP_LOGO, PATREON_APP_NAME } from './constants';

import * as PATREON_ACTIONS from './actions';
import * as PATREON_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: PATREON_APP_NAME,
    display_name: L[locale].apps[PATREON_APP_NAME].displayName(),
    short_desc: L[locale].apps[PATREON_APP_NAME].shortDesc(),
    desc: L[locale].apps[PATREON_APP_NAME].longDesc(),
    logo: PATREON_APP_LOGO,
    logo_file_name: 'patreon-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(PATREON_APP_NAME, PATREON_ACTIONS, locale),
      ...mapTriggersToApp(PATREON_APP_NAME, PATREON_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://www.patreon.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://www.patreon.com/oauth2/authorize',
      oauth2_token_url: 'https://www.patreon.com/api/oauth2/token',
      ping_method: 'GET',
      oauth2_scopes: [
        'identity',
        'identity.memberships',
        'campaigns',
        'w:campaigns.webhook',
        'campaigns.members',
        'campaigns.members.address',
        'campaigns.posts',
      ],
      ping_path: '/api/oauth2/v2/identity',
    },
  }) satisfies TQoreAppWithActions;
