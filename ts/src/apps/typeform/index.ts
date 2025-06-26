import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { TYPEFORM_APP_LOGO, TYPEFORM_APP_NAME } from './constants';

import * as TYPEFORM_TRIGGERS from './triggers';
import * as TYPEFORM_ACTIONS from './actions';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';

export default (locale: Locales) =>
  ({
    name: TYPEFORM_APP_NAME,
    display_name: L[locale].apps[TYPEFORM_APP_NAME].displayName(),
    short_desc: L[locale].apps[TYPEFORM_APP_NAME].shortDesc(),
    desc: L[locale].apps[TYPEFORM_APP_NAME].longDesc(),
    logo: TYPEFORM_APP_LOGO,
    logo_file_name: 'typeform-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(TYPEFORM_APP_NAME, TYPEFORM_ACTIONS, locale),
      ...mapTriggersToApp(TYPEFORM_APP_NAME, TYPEFORM_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.typeform.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://api.typeform.com/oauth/authorize',
      oauth2_token_url: 'https://api.typeform.com/oauth/token',
      oauth2_scopes: [
        'forms:read',
        'responses:read',
        'accounts:read',
        'webhooks:read',
        'webhooks:write',
        'images:read',
        'images:write',
        'forms:write',
        'workspaces:read',
        'offline',
      ],
      ping_method: 'GET',
      ping_path: '/me',
    },
  }) satisfies TQoreAppWithActions;
