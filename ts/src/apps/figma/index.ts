import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { FIGMA_APP_LOGO, FIGMA_APP_NAME } from './constants';

import * as FIGMA_ACTIONS from './actions';
import * as FIGMA_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: FIGMA_APP_NAME,
    display_name: L[locale].apps[FIGMA_APP_NAME].displayName(),
    short_desc: L[locale].apps[FIGMA_APP_NAME].shortDesc(),
    desc: L[locale].apps[FIGMA_APP_NAME].longDesc(),
    logo: FIGMA_APP_LOGO,
    logo_file_name: 'figma-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(FIGMA_APP_NAME, FIGMA_ACTIONS, locale),
      ...mapTriggersToApp(FIGMA_APP_NAME, FIGMA_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.figma.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_token_use_basic_auth: true,
      oauth2_auth_url: 'https://www.figma.com/oauth',
      oauth2_token_url: 'https://api.figma.com/v1/oauth/token',
      oauth2_scopes: [
        'file_content:read',
        'file_comments:read',
        'projects:read',
        'current_user:read',
        'file_versions:read',
        'file_comments:write',
      ],
      ping_method: 'GET',
      ping_path: '/v1/me',
    },
  }) satisfies TQoreAppWithActions;
