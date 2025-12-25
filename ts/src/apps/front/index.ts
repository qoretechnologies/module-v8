import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { FRONT_APP_LOGO, FRONT_APP_NAME } from './constants';

import * as FRONT_ACTIONS from './actions';
import * as FRONT_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: FRONT_APP_NAME,
    display_name: L[locale].apps[FRONT_APP_NAME].displayName(),
    short_desc: L[locale].apps[FRONT_APP_NAME].shortDesc(),
    desc: L[locale].apps[FRONT_APP_NAME].longDesc(),
    logo: FRONT_APP_LOGO,
    logo_file_name: 'front-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(FRONT_APP_NAME, FRONT_ACTIONS, locale),
      ...mapTriggersToApp(FRONT_APP_NAME, FRONT_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api2.frontapp.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.frontapp.com/oauth/authorize',
      oauth2_token_url: 'https://app.frontapp.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/me',
      oauth2_token_use_basic_auth: true,
    },
  }) satisfies TQoreAppWithActions;
