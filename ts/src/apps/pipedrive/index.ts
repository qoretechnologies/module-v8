import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { createSwaggerPaths, mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  PIPEDRIVE_ACTIONS,
  PIPEDRIVE_ALLOWED_PATHS,
  PIPEDRIVE_APP_LOGO,
  PIPEDRIVE_APP_NAME,
} from './constants';
import { actionsCatalogue } from '../../ActionsCatalogue';

import * as PIPEDRIVE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: PIPEDRIVE_APP_NAME,
    display_name: L[locale].apps[PIPEDRIVE_APP_NAME].displayName(),
    short_desc: L[locale].apps[PIPEDRIVE_APP_NAME].shortDesc(),
    desc: L[locale].apps[PIPEDRIVE_APP_NAME].longDesc(),
    logo: PIPEDRIVE_APP_LOGO,
    logo_file_name: 'pipedrive-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(PIPEDRIVE_APP_NAME, PIPEDRIVE_ACTIONS, locale),
      ...mapTriggersToApp(PIPEDRIVE_APP_NAME, PIPEDRIVE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.pipedrive.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: '145b10fac80be7a2',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(PIPEDRIVE_APP_NAME),
      oauth2_auth_url: 'https://oauth.pipedrive.com/oauth/authorize',
      oauth2_token_url: 'https://oauth.pipedrive.com/oauth/token',
      oauth2_token_use_basic_auth: true,
      oauth2_scopes: [
        'base',
        'deals:full',
        'mail:full',
        'activities:full',
        'contacts:read',
        'products:full',
        'users:read',
        'recents:read',
        'search:read',
        'leads:full',
        'phone-integration',
        'goals:read',
        'projects:full',
        'webhooks:fullbase',
        'deals:full',
        'mail:full',
        'activities:full',
        'contacts:read',
        'products:full',
        'users:read',
        'recents:read',
        'search:read',
        'leads:full',
        'phone-integration',
        'goals:read',
        'projects:full',
        'webhooks:full',
      ],
      ping_method: 'GET',
      ping_path: '/v1/users/me',
    },
    swagger: 'schemas/pipedrive.swagger.json',
    swagger_paths: createSwaggerPaths(PIPEDRIVE_ALLOWED_PATHS),
    swagger_options: {
      parse_flags: -1,
    },
  }) satisfies TQoreAppWithActions;
