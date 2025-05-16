import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as GOOGLE_DRIVE_ACTIONS from './actions';
import { GOOGLE_DRIVE_APP_LOGO, GOOGLE_DRIVE_APP_NAME } from './constants';
import * as GOOGLE_DRIVE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: GOOGLE_DRIVE_APP_NAME,
    display_name: L[locale].apps[GOOGLE_DRIVE_APP_NAME].displayName(),
    short_desc: L[locale].apps[GOOGLE_DRIVE_APP_NAME].shortDesc(),
    desc: L[locale].apps[GOOGLE_DRIVE_APP_NAME].longDesc(),
    logo: GOOGLE_DRIVE_APP_LOGO,
    logo_file_name: 'google-drive-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(GOOGLE_DRIVE_APP_NAME, GOOGLE_DRIVE_ACTIONS, locale),
      ...mapTriggersToApp(GOOGLE_DRIVE_APP_NAME, GOOGLE_DRIVE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://www.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: ['https://www.googleapis.com/auth/drive'],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/drive/v3/about?fields=user',
    },
  }) satisfies TQoreAppWithActions;
