import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { TELEGRAM_APP_LOGO, TELEGRAM_APP_NAME, TELEGRAM_CONN_OPTIONS } from './constants';

import * as TELEGRAM_ACTIONS from './actions';
import * as TELEGRAM_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[TELEGRAM_APP_NAME].displayName(),
    short_desc: L[locale].apps[TELEGRAM_APP_NAME].shortDesc(),
    desc: L[locale].apps[TELEGRAM_APP_NAME].longDesc(),
    name: TELEGRAM_APP_NAME,
    actions: [
      ...mapActionsToApp(TELEGRAM_APP_NAME, TELEGRAM_ACTIONS, locale),
      ...mapTriggersToApp(TELEGRAM_APP_NAME, TELEGRAM_TRIGGERS, locale),
    ],
    logo: TELEGRAM_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.telegram.org',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/bot{{token}}/getMe',
    },
    rest_modifiers: {
      options: TELEGRAM_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
