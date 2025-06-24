import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { BUSINESS_CENTRAL_APP_LOGO, BUSINESS_CENTRAL_APP_NAME } from './constants';

import * as BUSINESS_CENTRAL_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[BUSINESS_CENTRAL_APP_NAME].displayName(),
    short_desc: L[locale].apps[BUSINESS_CENTRAL_APP_NAME].shortDesc(),
    desc: L[locale].apps[BUSINESS_CENTRAL_APP_NAME].longDesc(),
    name: BUSINESS_CENTRAL_APP_NAME,
    actions: [...mapTriggersToApp(BUSINESS_CENTRAL_APP_NAME, BUSINESS_CENTRAL_TRIGGERS, locale)],
    logo: BUSINESS_CENTRAL_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.businesscentral.dynamics.com/v2.0/{{instance_type}}',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      oauth2_scopes: [
        'https://api.businesscentral.dynamics.com/user_impersonation',
        'https://api.businesscentral.dynamics.com/Financials.ReadWrite.All',
        'offline_access',
      ],
      ping_method: 'GET',
      ping_path: 'api/v2.0',
    },
  }) satisfies TQoreAppWithActions;
