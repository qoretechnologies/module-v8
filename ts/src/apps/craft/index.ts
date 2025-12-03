import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CRAFT_APP_LOGO, CRAFT_APP_NAME, CRAFT_CONN_OPTIONS } from './constants';

import * as CRAFT_ACTIONS from './actions';
import * as CRAFT_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: CRAFT_APP_NAME,
    display_name: L[locale].apps[CRAFT_APP_NAME].displayName(),
    short_desc: L[locale].apps[CRAFT_APP_NAME].shortDesc(),
    desc: L[locale].apps[CRAFT_APP_NAME].longDesc(),
    logo: CRAFT_APP_LOGO,
    logo_file_name: 'craft-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(CRAFT_APP_NAME, CRAFT_ACTIONS, locale),
      ...mapTriggersToApp(CRAFT_APP_NAME, CRAFT_TRIGGERS, locale),
    ],
    rest: {
      url: 'auto',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: 'collections',
    },
    rest_modifiers: {
      options: CRAFT_CONN_OPTIONS,
      required_options: 'url',
      url_from_option: 'url',
    },
  }) satisfies TQoreAppWithActions;
