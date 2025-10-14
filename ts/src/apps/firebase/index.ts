import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';

import * as FIREBASE_ACTIONS from './actions';
import * as FIREBASE_TRIGGERS from './triggers';
import { FIREBASE_APP_LOGO, FIREBASE_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: FIREBASE_APP_NAME,
    display_name: L[locale].apps[FIREBASE_APP_NAME].displayName(),
    short_desc: L[locale].apps[FIREBASE_APP_NAME].shortDesc(),
    desc: L[locale].apps[FIREBASE_APP_NAME].longDesc(),
    logo: FIREBASE_APP_LOGO,
    logo_file_name: 'firebase-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(FIREBASE_APP_NAME, FIREBASE_ACTIONS, locale),
      ...mapTriggersToApp(FIREBASE_APP_NAME, FIREBASE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://cloudresourcemanager.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: [
        'https://www.googleapis.com/auth/firebase',
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/firebase.messaging',
        'https://www.googleapis.com/auth/devstorage.read_write',
        'https://www.googleapis.com/auth/devstorage.full_control',
        'https://www.googleapis.com/auth/cloud-platform',
      ],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/v1/projects',
    },
  }) satisfies TQoreAppWithActions;
