import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { WEBFLOW_APP_LOGO, WEBFLOW_APP_NAME } from './constants';

import * as WEBFLOW_ACTIONS from './actions';
import * as WEBFLOW_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: WEBFLOW_APP_NAME,
    display_name: L[locale].apps[WEBFLOW_APP_NAME].displayName(),
    short_desc: L[locale].apps[WEBFLOW_APP_NAME].shortDesc(),
    desc: L[locale].apps[WEBFLOW_APP_NAME].longDesc(),
    logo: WEBFLOW_APP_LOGO,
    logo_file_name: 'webflow-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(WEBFLOW_APP_NAME, WEBFLOW_ACTIONS, locale),
      ...mapTriggersToApp(WEBFLOW_APP_NAME, WEBFLOW_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.webflow.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://webflow.com/oauth/authorize',
      oauth2_token_url: 'https://api.webflow.com/oauth/access_token',
      ping_method: 'GET',
      ping_path: '/v2/token/authorized_by',
    },
  }) satisfies TQoreAppWithActions;
