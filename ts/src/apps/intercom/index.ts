import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { INTERCOM_ACTIONS, INTERCOM_APP_LOGO, INTERCOM_APP_NAME } from './constants';
import * as INTERCOM_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: INTERCOM_APP_NAME,
    display_name: L[locale].apps[INTERCOM_APP_NAME].displayName(),
    short_desc: L[locale].apps[INTERCOM_APP_NAME].shortDesc(),
    desc: L[locale].apps[INTERCOM_APP_NAME].longDesc(),
    logo: INTERCOM_APP_LOGO,
    logo_file_name: 'intercom-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(INTERCOM_APP_NAME, INTERCOM_ACTIONS, locale),
      ...mapTriggersToApp(INTERCOM_APP_NAME, INTERCOM_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.intercom.io',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.intercom.com/oauth',
      oauth2_token_url: 'https://api.intercom.io/auth/eagle/token',
      ping_method: 'GET',
      ping_path: '/me',
    },
    swagger: 'schemas/intercom.swagger.json',
    // swagger_paths: createSwaggerPaths(INTERCOM_ALLOWED_PATHS),
    swagger_options: {
      parse_flags: -1,
    },
  }) satisfies TQoreAppWithActions;
