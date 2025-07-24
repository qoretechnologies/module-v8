import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { QUICKBOOKS_APP_LOGO, QUICKBOOKS_APP_NAME, QUICKBOOKS_CONN_OPTIONS } from './constants';

import * as QUICKBOOKS_ACTIONS from './actions';
import * as QUICKBOOKS_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[QUICKBOOKS_APP_NAME].displayName(),
    short_desc: L[locale].apps[QUICKBOOKS_APP_NAME].shortDesc(),
    desc: L[locale].apps[QUICKBOOKS_APP_NAME].longDesc(),
    name: QUICKBOOKS_APP_NAME,
    actions: [
      ...mapActionsToApp(QUICKBOOKS_APP_NAME, QUICKBOOKS_ACTIONS, locale),
      ...mapTriggersToApp(QUICKBOOKS_APP_NAME, QUICKBOOKS_TRIGGERS, locale),
    ],
    logo: QUICKBOOKS_APP_LOGO,
    logo_file_name: 'quickbooks-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://quickbooks.api.intuit.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://appcenter.intuit.com/connect/oauth2',
      oauth2_token_url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      oauth2_token_use_basic_auth: true,
      oauth2_scopes: [
        'com.intuit.quickbooks.accounting',
        'openid',
        'profile',
        'email',
        'phone',
        'address',
      ],
      ping_method: 'GET',
      ping_path: '/v3/company/{{realm_id}}/companyinfo/{{realm_id}}',
    },
    rest_modifiers: {
      options: QUICKBOOKS_CONN_OPTIONS,
      required_options: 'instance_type',
      url_template_options: ['realm_id'],
      set_options_post_auth: (context) => {
        const instanceType = context.conn_opts?.instance_type;

        return {
          url:
            instanceType === 'sandbox'
              ? 'https://sandbox-quickbooks.api.intuit.com'
              : 'https://quickbooks.api.intuit.com',
        };
      },
    },
  }) satisfies TQoreAppWithActions;
