import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SENSIBO_APP_LOGO, SENSIBO_APP_NAME, SENSIBO_CONN_OPTIONS } from './constants';

import * as SENSIBO_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SENSIBO_APP_NAME].displayName(),
    short_desc: L[locale].apps[SENSIBO_APP_NAME].shortDesc(),
    desc: L[locale].apps[SENSIBO_APP_NAME].longDesc(),
    name: SENSIBO_APP_NAME,
    actions: [...mapActionsToApp(SENSIBO_APP_NAME, SENSIBO_ACTIONS, locale)],
    logo: SENSIBO_APP_LOGO,
    logo_file_name: 'sensibo-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://home.sensibo.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v2/client/getState',
    },
    rest_modifiers: {
      options: SENSIBO_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
