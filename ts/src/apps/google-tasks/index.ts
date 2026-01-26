import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';

import * as GOOGLE_TASKS_ACTIONS from './actions';
import * as GOOGLE_TASKS_TRIGGERS from './triggers';
import { GOOGLE_TASKS_APP_LOGO, GOOGLE_TASKS_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: GOOGLE_TASKS_APP_NAME,
    display_name: L[locale].apps[GOOGLE_TASKS_APP_NAME].displayName(),
    short_desc: L[locale].apps[GOOGLE_TASKS_APP_NAME].shortDesc(),
    desc: L[locale].apps[GOOGLE_TASKS_APP_NAME].longDesc(),
    logo: GOOGLE_TASKS_APP_LOGO,
    logo_file_name: 'google-tasks-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(GOOGLE_TASKS_APP_NAME, GOOGLE_TASKS_ACTIONS, locale),
      ...mapTriggersToApp(GOOGLE_TASKS_APP_NAME, GOOGLE_TASKS_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://www.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: ['https://www.googleapis.com/auth/tasks', 'email', 'profile', 'openid'],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/oauth2/v3/userinfo',
    },
  }) satisfies TQoreAppWithActions;
