import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { BIG_ML_APP_LOGO, BIG_ML_APP_NAME, BIG_ML_CONN_OPTIONS } from './constants';

import * as BIG_ML_ACTIONS from './actions';
import * as BIG_ML_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[BIG_ML_APP_NAME].displayName(),
    short_desc: L[locale].apps[BIG_ML_APP_NAME].shortDesc(),
    desc: L[locale].apps[BIG_ML_APP_NAME].longDesc(),
    name: BIG_ML_APP_NAME,
    actions: [
      ...mapActionsToApp(BIG_ML_APP_NAME, BIG_ML_ACTIONS, locale),
      ...mapTriggersToApp(BIG_ML_APP_NAME, BIG_ML_TRIGGERS, locale),
    ],
    logo: BIG_ML_APP_LOGO,
    logo_file_name: 'big-ml-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://bigml.io',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/andromeda/project?username={{username}}&api_key={{token}}',
    },
    rest_modifiers: {
      options: BIG_ML_CONN_OPTIONS,
      required_options: 'token,username',
      url_template_options: ['token', 'username'],
    },
  }) satisfies TQoreAppWithActions;
