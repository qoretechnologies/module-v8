import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  MESSENGER360_APP_LOGO,
  MESSENGER360_APP_NAME,
  MESSENGER360_CONN_OPTIONS,
} from './constants';

import * as MESSENGER360_ACTIONS from './actions';
import * as MESSENGER360_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[MESSENGER360_APP_NAME].displayName(),
    short_desc: L[locale].apps[MESSENGER360_APP_NAME].shortDesc(),
    desc: L[locale].apps[MESSENGER360_APP_NAME].longDesc(),
    name: MESSENGER360_APP_NAME,
    actions: [
      ...mapActionsToApp(MESSENGER360_APP_NAME, MESSENGER360_ACTIONS, locale),
      ...mapTriggersToApp(MESSENGER360_APP_NAME, MESSENGER360_TRIGGERS, locale),
    ],
    logo: MESSENGER360_APP_LOGO,
    logo_file_name: 'messenger360-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.360messenger.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v2/client/getState',
    },
    rest_modifiers: {
      options: MESSENGER360_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
