import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SENTRY_APP_LOGO, SENTRY_APP_NAME, SENTRY_CONN_OPTIONS } from './constants';

import * as SENTRY_ACTIONS from './actions';
import * as SENTRY_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SENTRY_APP_NAME].displayName(),
    short_desc: L[locale].apps[SENTRY_APP_NAME].shortDesc(),
    desc: L[locale].apps[SENTRY_APP_NAME].longDesc(),
    name: SENTRY_APP_NAME,
    actions: [
      ...mapActionsToApp(SENTRY_APP_NAME, SENTRY_ACTIONS, locale),
      ...mapTriggersToApp(SENTRY_APP_NAME, SENTRY_TRIGGERS, locale),
    ],
    logo: SENTRY_APP_LOGO,
    logo_file_name: 'sentry-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://sentry.io',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/0/',
    },
    rest_modifiers: {
      options: SENTRY_CONN_OPTIONS,
      required_options: 'token,organization',
    },
  }) satisfies TQoreAppWithActions;
