import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import magento from '../../schemas/magento.swagger.json';
import { MAGENTO_CARTS_ALLOWED_PATHS } from './allowed-paths/carts';
import { MAGENTO_CUSTOMERS_ALLOWED_PATHS } from './allowed-paths/customers';
import { MAGENTO_INVOICES_ALLOWED_PATHS } from './allowed-paths/invoices';
import { MAGENTO_ORDERS_ALLOWED_PATHS } from './allowed-paths/orders';
import { MAGENTO_PRODUCTS_ALLOWED_PATHS } from './allowed-paths/products';
import { MAGENTO_SHIPMENTS_ALLOWED_PATHS } from './allowed-paths/shipments';
import { MAGENTO_TRANSACTIONS_ALLOWED_PATHS } from './allowed-paths/transactions';

export const MAGENTO_CONN_OPTIONS = {
  username: {
    type: 'string',
    display_name: 'Username',
    desc: 'The username of the Magento account',
  },
  password: {
    display_name: 'Password',
    type: 'string',
    desc: 'The password of the Magento account',
  },
} satisfies TCustomConnOptions;
export const MAGENTO_APP_NAME = 'Magento';
export const MAGENTO_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTI5LjE2IDEzMzMuMzMiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02MzguOTEgMzk5Ljkzdjc1OS41bC03NC42OSA0NS42NS03NC43NS00NS44OVY0MDAuNTJMMjk1LjkzIDUxOS42OHY2NDkuNTFsMjY4LjI4IDE2NC4xNSAyNzAuNTUtMTY1LjMyVjUxOS4yN0w2MzguODkgMzk5Ljk0ek01NjQuMjIgMEwwIDM0MS44NHY2NDkuNTlsMTQ2LjU0IDg2LjMzVjQyOC4xMWw0MTcuOC0yNTQuMDQgNDE4LjE5IDI1My42NyAxLjcyLjk4LS4xOSA2NDguMDcgMTQ1LjEtODUuMzZWMzQxLjg0TDU2NC4yMyAweiIgZmlsbD0iI2YyNjMyMiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9zdmc+';

export const MAGENTO_ALLOWED_PATHS = {
  ...MAGENTO_CARTS_ALLOWED_PATHS,
  ...MAGENTO_CUSTOMERS_ALLOWED_PATHS,
  ...MAGENTO_INVOICES_ALLOWED_PATHS,
  ...MAGENTO_ORDERS_ALLOWED_PATHS,
  ...MAGENTO_PRODUCTS_ALLOWED_PATHS,
  ...MAGENTO_SHIPMENTS_ALLOWED_PATHS,
  ...MAGENTO_TRANSACTIONS_ALLOWED_PATHS,
} satisfies TAllowedPaths;

export const MAGENTO_ACTIONS = buildActionsFromSwaggerSchema({
  schema: magento,
  allowedPaths: MAGENTO_ALLOWED_PATHS,
  app: MAGENTO_APP_NAME,
});
