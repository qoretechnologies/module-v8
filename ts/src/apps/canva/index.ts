import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CANVA_APP_LOGO, CANVA_APP_NAME } from './constants';

import * as CAMVA_ACTIONS from './actions';
import * as CAMVA_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: CANVA_APP_NAME,
    display_name: L[locale].apps[CANVA_APP_NAME].displayName(),
    short_desc: L[locale].apps[CANVA_APP_NAME].shortDesc(),
    desc: L[locale].apps[CANVA_APP_NAME].longDesc(),
    logo: CANVA_APP_LOGO,
    logo_file_name: 'canva-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(CANVA_APP_NAME, CAMVA_ACTIONS, locale),
      ...mapTriggersToApp(CANVA_APP_NAME, CAMVA_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.canva.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_token_use_basic_auth: true,
      oauth2_pkce: 'S256',
      oauth2_auth_url: 'https://www.canva.com/api/oauth/authorize',
      oauth2_token_url: 'https://api.canva.com/rest/v1/oauth/token',
      oauth2_scopes: [
        'comment:write',
        'comment:read',
        'asset:read',
        'asset:write',
        'design:meta:read',
        'design:permission:read',
        'profile:read',
        'folder:read',
        'app:read',
      ],
      ping_method: 'GET',
      ping_path: '/rest/v1/users/me',
    },
  }) satisfies TQoreAppWithActions;
