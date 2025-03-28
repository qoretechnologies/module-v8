import {
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as MAGENTO_TRIGGERS from './triggers';
import {
  MAGENTO_ACTIONS,
  MAGENTO_APP_LOGO,
  MAGENTO_APP_NAME,
  MAGENTO_CONN_OPTIONS,
} from './constants';

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
      url: '{{instance_url}}/rest',
      oauth2_token_url: '{{instance_url}}/rest/V1/integration/admin/token',
      oauth2_token_expiry_hint: 60,
      data: 'json',
      oauth2_grant_type: 'password',
      ping_method: 'GET',
      ping_path: '/V1/store/storeConfigs',
    },
    rest_modifiers: {
      required_options: 'instance_url,username,password',
      url_template_options: ['instance_url'],
      set_options_post_auth: (
        context: Omit<TQoreAppActionFunctionContext<typeof MAGENTO_CONN_OPTIONS>, 'opts'>
      ): TQoreMappedOptions<typeof MAGENTO_CONN_OPTIONS> => {
        const instanceUrl = context.conn_opts?.instance_url;
        const username = context.conn_opts?.username;
        const password = context.conn_opts?.password;

        const missingValues: string[] = [];

        if (!instanceUrl) missingValues.push('instance_url');
        if (!username) missingValues.push('username');
        if (!password) missingValues.push('password');

        if (missingValues.length) {
          throw new Error(`All of the following values are required: ${missingValues.join(', ')}`);
        }

        return {
          instance_url: instanceUrl!,
          username: username!,
          password: password!,
        };
      },
    },
  }) satisfies TQoreAppWithActions;
