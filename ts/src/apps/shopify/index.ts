import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as actions from './actions';
import { SHOPIFY_APP_LOGO, SHOPIFY_APP_NAME, SHOPIFY_CONN_OPTIONS } from './constants';

const SHOPIFY_ACTIONS = Object.values(actions);

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SHOPIFY_APP_NAME].displayName(),
    short_desc: L[locale].apps[SHOPIFY_APP_NAME].shortDesc(),
    desc: L[locale].apps[SHOPIFY_APP_NAME].longDesc(),
    name: SHOPIFY_APP_NAME,
    actions: [...mapActionsToApp(SHOPIFY_APP_NAME, SHOPIFY_ACTIONS, locale)],
    logo: SHOPIFY_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',

    rest: {
      url: 'https://{shop}.myshopify.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://{shop}.myshopify.com/admin/oauth/authorize',
      oauth2_token_url: 'https://{shop}.myshopify.com/admin/oauth/access_token',
      oauth2_scopes: [
        'read_products',
        'write_products',
        'read_orders',
        'write_orders',
        'read_customers',
        'write_customers',
        'read_inventory',
        'write_inventory',
        'read_shipping',
        'write_shipping',
        'read_content',
        'write_content',
      ],
      ping_path: '/admin/api/2023-07/shop.json',
      ping_method: 'GET',
    },
    rest_modifiers: {
      options: SHOPIFY_CONN_OPTIONS,
      required_options: 'shop',
      url_template_options: ['shop'],
    },
  }) satisfies TQoreAppWithActions;
