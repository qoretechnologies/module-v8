import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { HELPSCOUT_APP_LOGO, HELPSCOUT_APP_NAME } from './constants';

import * as HELPSCOUT_ACTIONS from './actions';
import * as HELPSCOUT_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: HELPSCOUT_APP_NAME,
    display_name: L[locale].apps[HELPSCOUT_APP_NAME].displayName(),
    short_desc: L[locale].apps[HELPSCOUT_APP_NAME].shortDesc(),
    desc: L[locale].apps[HELPSCOUT_APP_NAME].longDesc(),
    logo: HELPSCOUT_APP_LOGO,
    logo_file_name: 'helpscout-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(HELPSCOUT_APP_NAME, HELPSCOUT_ACTIONS, locale),
      ...mapTriggersToApp(HELPSCOUT_APP_NAME, HELPSCOUT_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.helpscout.net',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://secure.helpscout.net/authentication/authorizeClientApplication',
      oauth2_token_url: 'https://api.helpscout.net/v2/oauth2/token',
      ping_method: 'GET',
      ping_path: 'v2/users/me',
    },
  }) satisfies TQoreAppWithActions;
