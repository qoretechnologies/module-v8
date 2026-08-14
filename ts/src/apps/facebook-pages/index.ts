import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  FACEBOOK_PAGES_API_VERSION,
  FACEBOOK_PAGES_APP_API_URL,
  FACEBOOK_PAGES_APP_LOGO,
  FACEBOOK_PAGES_APP_NAME,
} from './constants';

import * as FACEBOOK_PAGES_ACTIONS from './actions';
import * as FACEBOOK_PAGES_TRIGGERS from './triggers';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';

export default (locale: Locales) =>
  ({
    name: FACEBOOK_PAGES_APP_NAME,
    display_name: L[locale].apps[FACEBOOK_PAGES_APP_NAME].displayName(),
    short_desc: L[locale].apps[FACEBOOK_PAGES_APP_NAME].shortDesc(),
    desc: L[locale].apps[FACEBOOK_PAGES_APP_NAME].longDesc(),
    logo: FACEBOOK_PAGES_APP_LOGO,
    logo_file_name: 'facebook-pages-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(FACEBOOK_PAGES_APP_NAME, FACEBOOK_PAGES_ACTIONS, locale),
      ...mapTriggersToApp(FACEBOOK_PAGES_APP_NAME, FACEBOOK_PAGES_TRIGGERS, locale),
    ],
    rest: {
      url: FACEBOOK_PAGES_APP_API_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      // the OAuth endpoints are versioned like every other Graph route, so they must ride the same
      // pin the REST calls and the SDK do; these were left on a literal `v23.0` when the rest of
      // the application moved to v24, which is the same split the pin exists to prevent
      oauth2_auth_url: `https://www.facebook.com/${FACEBOOK_PAGES_API_VERSION}/dialog/oauth`,
      oauth2_token_url: `https://graph.facebook.com/${FACEBOOK_PAGES_API_VERSION}/oauth/access_token`,
      oauth2_scopes: [
        'business_management',
        'pages_read_engagement',
        'pages_show_list',
        'pages_read_user_content',
        'pages_manage_posts',
        'pages_manage_engagement',
        'pages_manage_metadata',
        'email',
      ],
      ping_method: 'GET',
      ping_path: 'me',
    },
  }) satisfies TQoreAppWithActions;
