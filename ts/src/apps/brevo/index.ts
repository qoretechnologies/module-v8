import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { BREVO_APP_LOGO, BREVO_APP_NAME, BREVO_CONN_OPTIONS } from './constants';

import * as BREVO_ACTIONS from './actions';
import * as BREVO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[BREVO_APP_NAME].displayName(),
    short_desc: L[locale].apps[BREVO_APP_NAME].shortDesc(),
    desc: L[locale].apps[BREVO_APP_NAME].longDesc(),
    name: BREVO_APP_NAME,
    actions: [
      ...mapActionsToApp(BREVO_APP_NAME, BREVO_ACTIONS, locale),
      ...mapTriggersToApp(BREVO_APP_NAME, BREVO_TRIGGERS, locale),
    ],
    logo: BREVO_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.brevo.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v3/account',
      token_api_key_header: 'api-key',
    },
    rest_modifiers: {
      options: BREVO_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
