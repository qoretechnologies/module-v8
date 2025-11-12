import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  ZOHO_CRM_API_VERSION,
  ZOHO_CRM_APP_LOGO,
  ZOHO_CRM_APP_NAME,
  ZOHO_CRM_CONN_OPTIONS,
} from './constants';

import * as ZOHO_CRM_ACTIONS from './actions';
import * as ZOHO_CRM_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: ZOHO_CRM_APP_NAME,
    display_name: L[locale].apps[ZOHO_CRM_APP_NAME].displayName(),
    short_desc: L[locale].apps[ZOHO_CRM_APP_NAME].shortDesc(),
    desc: L[locale].apps[ZOHO_CRM_APP_NAME].longDesc(),
    logo: ZOHO_CRM_APP_LOGO,
    logo_file_name: 'zoho-crm-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(ZOHO_CRM_APP_NAME, ZOHO_CRM_ACTIONS, locale),
      ...mapTriggersToApp(ZOHO_CRM_APP_NAME, ZOHO_CRM_TRIGGERS, locale),
    ],
    rest: {
      url: 'auto',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.zoho.com/oauth/v2/auth',
      oauth2_token_url: '{{domain}}/oauth/v2/token',
      oauth2_auth_args: {
        response_type: 'code',
        access_type: 'offline',
      },
      oauth2_scopes: [
        'ZohoCRM.modules.ALL',
        'ZohoCRM.settings.ALL',
        'ZohoCRM.users.ALL',
        'ZohoCRM.org.ALL',
        'ZohoCRM.notifications.ALL',
        'ZohoCRM.files.CREATE',
        'ZohoCRM.org.READ',
        'ZohoSearch.securesearch.READ',
      ],
      ping_method: 'GET',
      ping_path: `/${ZOHO_CRM_API_VERSION}/users`,
    },
    rest_modifiers: {
      options: ZOHO_CRM_CONN_OPTIONS,
      required_options: 'domain',
      url_template_options: ['domain'],
      url_from_option: 'domain',
    },
  }) satisfies TQoreAppWithActions;
