import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { BROWSE_AI_APP_LOGO, BROWSE_AI_APP_NAME, BROWSE_AI_CONN_OPTIONS } from './constants';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';

import * as BROWSE_AI_ACTIONS from './actions';
import * as BROWSE_AI_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[BROWSE_AI_APP_NAME].displayName(),
    short_desc: L[locale].apps[BROWSE_AI_APP_NAME].shortDesc(),
    desc: L[locale].apps[BROWSE_AI_APP_NAME].longDesc(),
    name: BROWSE_AI_APP_NAME,
    actions: [
      ...mapActionsToApp(BROWSE_AI_APP_NAME, BROWSE_AI_ACTIONS, locale),
      ...mapTriggersToApp(BROWSE_AI_APP_NAME, BROWSE_AI_TRIGGERS, locale),
    ],
    logo: BROWSE_AI_APP_LOGO,
    logo_file_name: 'browse-ai-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.browse.ai',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v2/status',
    },
    rest_modifiers: {
      options: BROWSE_AI_CONN_OPTIONS,
      required_options: 'api_key',
    },
  }) satisfies TQoreAppWithActions;
