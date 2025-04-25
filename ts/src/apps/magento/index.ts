import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { MAGENTO_ACTIONS, MAGENTO_APP_LOGO, MAGENTO_APP_NAME } from './constants';
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
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/rest/V1/store/storeConfigs',
      custom_token_auth: 'body-user-pass',
      custom_token_location: 'body-direct',
      custom_token_method: 'POST',
      custom_token_path: '/rest/V1/integration/admin/token',
    },
    rest_modifiers: {
      required_options: 'username,password',
    },
  }) satisfies TQoreAppWithActions;
