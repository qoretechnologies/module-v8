import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CLAUDE_APP_LOGO, CLAUDE_APP_NAME, CLAUDE_CONN_OPTIONS } from './constants';

import { mapActionsToApp } from '../../global/helpers';

import * as CLAUDE_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[CLAUDE_APP_NAME].displayName(),
    short_desc: L[locale].apps[CLAUDE_APP_NAME].shortDesc(),
    desc: L[locale].apps[CLAUDE_APP_NAME].longDesc(),
    name: CLAUDE_APP_NAME,
    actions: [...mapActionsToApp(CLAUDE_APP_NAME, CLAUDE_ACTIONS, locale)],
    logo: CLAUDE_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.anthropic.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v1/models',
      token_api_key_header: 'x-api-key',
      ping_headers: {
        'anthropic-version': '2023-06-01',
      },
    },
    rest_modifiers: {
      options: CLAUDE_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
