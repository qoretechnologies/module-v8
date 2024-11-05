import { TAllowedPaths } from '../../global/models/qore';

export const STRIPE_APP_NAME = 'Stripe';
export const STRIPE_ALLOWED_PATHS: TAllowedPaths = {
  '/v1/account': {
    GET: {},
  },
  '/v1/account_links': {
    POST: {},
  },
  '/v1/accounts/{account}': {
    DELETE: {},
    GET: {},
    POST: {},
  },
  '/v1/accounts/{account}/external_accounts': {
    GET: {},
    POST: {},
  },
  '/v1/accounts/{account}/login_links': {
    POST: {},
  },
  '/v1/accounts/{account}/people': {
    GET: {},
    POST: {},
  },
  '/v1/balance': {
    GET: {},
  },
  '/v1/balance/history': {
    GET: {},
  },
  '/v1/balance/history/{id}': {
    GET: {},
  },
  '/v1/charges': {
    GET: {},
    POST: {},
  },
  '/v1/charges/{charge}': {
    GET: {},
    POST: {},
  },
  '/v1/customers': {
    GET: {},
    POST: {},
  },
  '/v1/customers/{customer}': {
    DELETE: {},
    GET: {},
    POST: {},
  },
  '/v1/customers/{customer}/balance_transactions': {
    GET: {},
    POST: {},
  },
  '/v1/customers/{customer}/sources': {
    GET: {},
    POST: {},
  },
  '/v1/customers/{customer}/subscriptions': {
    GET: {},
    POST: {},
  },
  '/v1/invoices': {
    GET: {},
    POST: {},
  },
  '/v1/invoices/{invoice}': {
    DELETE: {},
    GET: {},
    POST: {},
  },
  '/v1/payment_intents': {
    GET: {},
    POST: {},
  },
  '/v1/refunds': {
    GET: {},
    POST: {},
  },
};
