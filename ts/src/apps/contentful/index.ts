import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CONTENTFUL_APP_LOGO, CONTENTFUL_APP_NAME, CONTENTFUL_API_URL, CONTENTFUL_CONN_OPTIONS } from './constants';

import * as CONTENTFUL_ACTIONS from './actions';
import * as CONTENTFUL_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: CONTENTFUL_APP_NAME,
    display_name: L[locale].apps[CONTENTFUL_APP_NAME].displayName(),
    short_desc: L[locale].apps[CONTENTFUL_APP_NAME].shortDesc(),
    desc: L[locale].apps[CONTENTFUL_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(CONTENTFUL_APP_NAME, CONTENTFUL_ACTIONS, locale),
      ...mapTriggersToApp(CONTENTFUL_APP_NAME, CONTENTFUL_TRIGGERS, locale),
    ],
    logo: CONTENTFUL_APP_LOGO,
    logo_file_name: 'contentful-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: CONTENTFUL_API_URL,
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/spaces',
      token_type: 'Bearer',
    },
    rest_modifiers: {
      options: CONTENTFUL_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
