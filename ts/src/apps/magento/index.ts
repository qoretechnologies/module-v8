import {
  QorusRequest,
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  MAGENTO_ACTIONS,
  MAGENTO_APP_LOGO,
  MAGENTO_APP_NAME,
  MAGENTO_CONN_OPTIONS,
} from './constants';
import * as MAGENTO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[MAGENTO_APP_NAME].displayName(),
    short_desc: L[locale].apps[MAGENTO_APP_NAME].shortDesc(),
    desc: L[locale].apps[MAGENTO_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(MAGENTO_APP_NAME, MAGENTO_ACTIONS, locale),
      ...mapTriggersToApp(MAGENTO_APP_NAME, MAGENTO_TRIGGERS, locale),
    ],
    name: MAGENTO_APP_NAME,
    logo: MAGENTO_APP_LOGO,
    logo_file_name: 'magento-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/magento.swagger.json',
    swagger_options: {
      parse_flags: -1,
    },
    swagger_type_overrides: {
      'sales-data-order-payment-interface.additional_information': {
        required: false,
      },
      'sales-data-order-payment-interface.account_status': {
        required: false,
      },
      'sales-data-invoice-comment-interface.is_visible_on_front': {
        required: false,
      },
      'sales-data-invoice-comment-interface.parent_id': {
        required: false,
      },
      'sales-data-invoice-comment-interface.is_customer_notified': {
        required: false,
      },
    },
    rest: {
      url: '',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/V1/store/storeConfigs',
      custom_token_refresh_auth: 'body-user-pass',
      custom_token_refresh_location: 'body-plain',
      custom_token_refresh_method: 'POST',
      custom_token_refresh_path: '/V1/integration/admin/token',
    },
    rest_modifiers: {
      options: MAGENTO_CONN_OPTIONS,
      required_options: 'url,username,password',
      url_template_options: ['url'],
      set_options_post_auth: async (
        context: Omit<TQoreAppActionFunctionContext<typeof MAGENTO_CONN_OPTIONS>, 'opts'>
      ): Promise<TQoreMappedOptions<typeof MAGENTO_CONN_OPTIONS>> => {
        const instanceUrl = context.conn_opts?.url;
        const username = context.conn_opts?.username;
        const password = context.conn_opts?.password;

        const missingValues: string[] = [];

        if (!instanceUrl) missingValues.push('url');
        if (!username) missingValues.push('username');
        if (!password) missingValues.push('password');

        if (missingValues.length) {
          throw new Error(`All of the following values are required: ${missingValues.join(', ')}`);
        }

        const response = await QorusRequest.post<{ data: string }>(
          {
            path: '/rest/V1/integration/admin/token',
            data: {
              username: username!,
              password: password!,
            },
          },
          { url: instanceUrl!, endpointId: 'magento' }
        );

        if (!response?.data) {
          throw new Error('Failed to get token from Magento');
        }

        const token = response.data;

        return {
          token,
          url: `${instanceUrl!}/rest`,
          username: username!,
          password: password!,
        } as any;
      },
    },
  }) satisfies TQoreAppWithActions;
