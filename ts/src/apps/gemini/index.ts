import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { GEMINI_APP_LOGO, GEMINI_APP_NAME, GEMINI_CONN_OPTIONS } from './constants';

import { mapActionsToApp } from '../../global/helpers';

import * as GEMINI_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[GEMINI_APP_NAME].displayName(),
    short_desc: L[locale].apps[GEMINI_APP_NAME].shortDesc(),
    desc: L[locale].apps[GEMINI_APP_NAME].longDesc(),
    name: GEMINI_APP_NAME,
    actions: [...mapActionsToApp(GEMINI_APP_NAME, GEMINI_ACTIONS, locale)],
    logo: GEMINI_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://generativelanguage.googleapis.com',
      data: 'json',
      token_api_key_header: 'X-goog-api-key',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v1/models',
    },
    rest_modifiers: {
      options: GEMINI_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
