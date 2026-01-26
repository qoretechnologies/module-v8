import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CALENDLY_APP_LOGO, CALENDLY_APP_NAME } from './constants';

import * as CALENDLY_ACTIONS from './actions';
import * as CALENDLY_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: CALENDLY_APP_NAME,
    display_name: L[locale].apps[CALENDLY_APP_NAME].displayName(),
    short_desc: L[locale].apps[CALENDLY_APP_NAME].shortDesc(),
    desc: L[locale].apps[CALENDLY_APP_NAME].longDesc(),
    logo: CALENDLY_APP_LOGO,
    logo_file_name: 'calendly-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(CALENDLY_APP_NAME, CALENDLY_ACTIONS, locale),
      ...mapTriggersToApp(CALENDLY_APP_NAME, CALENDLY_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.calendly.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://auth.calendly.com/oauth/authorize',
      oauth2_token_url: 'https://auth.calendly.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/users/me',
    },
  }) satisfies TQoreAppWithActions;
