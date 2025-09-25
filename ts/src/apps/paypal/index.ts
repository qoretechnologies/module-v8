import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { PAYPAL_APP_LOGO, PAYPAL_APP_NAME, PAYPAL_CONN_OPTIONS } from './constants';

import * as PAYPAL_ACTIONS from './actions';
import * as PAYPAL_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[PAYPAL_APP_NAME].displayName(),
    short_desc: L[locale].apps[PAYPAL_APP_NAME].shortDesc(),
    desc: L[locale].apps[PAYPAL_APP_NAME].longDesc(),
    name: PAYPAL_APP_NAME,
    actions: [
      ...mapActionsToApp(PAYPAL_APP_NAME, PAYPAL_ACTIONS, locale),
      ...mapTriggersToApp(PAYPAL_APP_NAME, PAYPAL_TRIGGERS, locale),
    ],
    logo: PAYPAL_APP_LOGO,
    logo_file_name: 'paypal-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://{{environment}}.paypal.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v1/identity/oauth2/userinfo',
      oauth2_token_use_basic_auth: true,
      oauth2_auth_args: {
        grant_type: 'client_credentials',
      },
    },
    rest_modifiers: {
      options: PAYPAL_CONN_OPTIONS,
      required_options: 'oauth2_client_id,oauth2_client_secret,environment',
      url_template_options: ['environment'],
    },
  }) satisfies TQoreAppWithActions;
