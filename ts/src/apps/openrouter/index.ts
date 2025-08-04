import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';

import { mapActionsToApp } from '../../global/helpers';

import * as OPEN_ROUTER_ACTIONS from './actions';
import { OPEN_ROUTER_APP_LOGO, OPEN_ROUTER_APP_NAME, OPEN_ROUTER_CONN_OPTIONS } from './constants';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[OPEN_ROUTER_APP_NAME].displayName(),
    short_desc: L[locale].apps[OPEN_ROUTER_APP_NAME].shortDesc(),
    desc: L[locale].apps[OPEN_ROUTER_APP_NAME].longDesc(),
    name: OPEN_ROUTER_APP_NAME,
    actions: [...mapActionsToApp(OPEN_ROUTER_APP_NAME, OPEN_ROUTER_ACTIONS, locale)],
    logo: OPEN_ROUTER_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://openrouter.ai',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/v1/credits',
    },
    rest_modifiers: {
      options: OPEN_ROUTER_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
