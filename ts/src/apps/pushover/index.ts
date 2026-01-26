
import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  PUSHOVER_APP_LOGO,
  PUSHOVER_APP_NAME,
  PUSHOVER_BASE_URL,
  PUSHOVER_CONN_OPTIONS,
} from './constants';

import * as PUSHOVER_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[PUSHOVER_APP_NAME].displayName(),
    short_desc: L[locale].apps[PUSHOVER_APP_NAME].shortDesc(),
    desc: L[locale].apps[PUSHOVER_APP_NAME].longDesc(),
    name: PUSHOVER_APP_NAME,
    actions: mapActionsToApp(PUSHOVER_APP_NAME, PUSHOVER_ACTIONS, locale),
    logo: PUSHOVER_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: PUSHOVER_BASE_URL,
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'POST',
      ping_path: '/users/validate.json',
    },
    rest_modifiers: {
      options: PUSHOVER_CONN_OPTIONS,
      required_options: 'token,user',
    },
  }) satisfies TQoreAppWithActions;
