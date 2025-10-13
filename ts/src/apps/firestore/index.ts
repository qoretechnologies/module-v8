import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';

import * as FIRESTORE_ACTIONS from './actions';
import * as FIRESTORE_TRIGGERS from './triggers';
import { FIRESTORE_APP_LOGO, FIRESTORE_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: FIRESTORE_APP_NAME,
    display_name: L[locale].apps[FIRESTORE_APP_NAME].displayName(),
    short_desc: L[locale].apps[FIRESTORE_APP_NAME].shortDesc(),
    desc: L[locale].apps[FIRESTORE_APP_NAME].longDesc(),
    logo: FIRESTORE_APP_LOGO,
    logo_file_name: 'firestore-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(FIRESTORE_APP_NAME, FIRESTORE_ACTIONS, locale),
      ...mapTriggersToApp(FIRESTORE_APP_NAME, FIRESTORE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://cloudresourcemanager.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: [
        'https://www.googleapis.com/auth/firebase.database',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/firebase.readonly',
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/devstorage.read_write',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/v1/projects',
    },
  }) satisfies TQoreAppWithActions;
