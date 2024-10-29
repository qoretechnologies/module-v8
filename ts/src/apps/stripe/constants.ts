import { createAllowedPaths } from '../../global/helpers';

export const STRIPE_APP_NAME = 'Stripe';
export const STRIPE_ALLOWED_PATHS = createAllowedPaths([
  '/v1/account',
  '/v1/account_links',
  '/v1/accounts/{account}',
  '/v1/accounts/{account}/login_links',
  '/v1/accounts/{account}/people',
  '/v1/accounts/{account}/external_accounts',
  '/v1/balance',
  '/v1/balance/history',
  '/v1/balance/history/{id}',
  '/v1/charges',
  '/v1/charges/{charge}',
  '/v1/customers',
  '/v1/customers/{customer}',
  '/v1/customers/{customer}/balance_transactions',
  '/v1/customers/{customer}/sources',
  '/v1/customers/{customer}/subscriptions',
  '/v1/invoices',
  '/v1/invoices/{invoice}',
  '/v1/payment_intents',
  '/v1/refunds',
]);
