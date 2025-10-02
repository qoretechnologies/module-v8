import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { TODOIST_APP_LOGO, TODOIST_APP_NAME } from './constants';

import * as TODOIST_ACTIONS from './actions';
import * as TODOIST_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: TODOIST_APP_NAME,
    display_name: L[locale].apps[TODOIST_APP_NAME].displayName(),
    short_desc: L[locale].apps[TODOIST_APP_NAME].shortDesc(),
    desc: L[locale].apps[TODOIST_APP_NAME].longDesc(),
    logo: TODOIST_APP_LOGO,
    logo_file_name: 'todoist-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(TODOIST_APP_NAME, TODOIST_ACTIONS, locale),
      ...mapTriggersToApp(TODOIST_APP_NAME, TODOIST_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.todoist.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://todoist.com/oauth/authorize',
      oauth2_token_url: 'https://todoist.com/oauth/access_token',
      ping_method: 'GET',
      oauth2_scopes: ['data:read_write', 'data:delete'],
      ping_path: '/api/v1/user',
    },
  }) satisfies TQoreAppWithActions;
