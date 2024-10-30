import { createAllowedPaths } from '../../global/helpers';

export const STRIPE_APP_NAME = 'Stripe';
export const STRIPE_ALLOWED_PATHS = createAllowedPaths([
  {
    path: '/v1/account:GET',
    display_name: 'Get account details',
    short_desc: 'Retrieves the details of the account.',
  },
  {
    path: '/v1/account_links:POST',
    display_name: 'Create account links',
    short_desc:
      'Creates a url that the platform can redirect their user to take them through the Connect Onboarding flow',
  },
  {
    path: '/v1/accounts/{account}:DELETE',
    display_name: 'Delete account',
    short_desc: 'Deletes the specified account',
  },
  {
    path: '/v1/accounts/{account}:GET',
    display_name: 'Retrieve account',
    short_desc: 'Retrieves the details of an account',
  },
  {
    path: '/v1/accounts/{account}:POST',
    display_name: 'Update account',
    short_desc: 'Updates the specified account by setting the values of the parameters passed',
  },
  {
    path: '/v1/accounts/{account}/external_accounts:GET',
    display_name: 'List external accounts',
    short_desc: 'Returns a list of external accounts associated with the Stripe account',
  },
  {
    path: '/v1/accounts/{account}/external_accounts:POST',
    display_name: 'Create external account',
    short_desc: 'Create an external account for a connected account',
  },
  {
    path: '/v1/accounts/{account}/login_links:POST',
    display_name: 'Create login links',
    short_desc: 'Creates a short-lived link that can be used to log in to the Stripe Dashboard',
  },
  {
    path: '/v1/accounts/{account}/people:GET',
    display_name: 'List people',
    short_desc: 'Returns a list of people associated with the account',
  },
  {
    path: '/v1/accounts/{account}/people:POST',
    display_name: 'Create person',
    short_desc: 'Creates a new person',
  },
  {
    path: '/v1/balance:GET',
    display_name: 'Retrieve balance',
    short_desc: 'Retrieves the current account balance',
  },
  {
    path: '/v1/balance/history:GET',
    display_name: 'List balance history',
    short_desc:
      'Returns a list of transactions that have contributed to the Stripe account balance',
  },
  {
    path: '/v1/balance/history/{id}:GET',
    display_name: 'Retrieve balance history',
    short_desc: 'Retrieves the details of a balance history item',
  },
  {
    path: '/v1/charges:GET',
    display_name: 'List charges',
    short_desc: 'Returns a list of charges you have previously created',
  },
  {
    path: '/v1/charges:POST',
    display_name: 'Create charge',
    short_desc: 'Creates a new charge object',
  },
  {
    path: '/v1/charges/{charge}:GET',
    display_name: 'Retrieve charge',
    short_desc: 'Retrieves the details of a charge',
  },
  {
    path: '/v1/charges/{charge}:POST',
    display_name: 'Update charge',
    short_desc: 'Updates the specified charge by setting the values of the parameters passed',
  },
  {
    path: '/v1/customers:GET',
    display_name: 'List customers',
    short_desc: 'Returns a list of your customers',
  },
  {
    path: '/v1/customers:POST',
    display_name: 'Create customer',
    short_desc: 'Creates a new customer object',
  },
  {
    path: '/v1/customers/{customer}:DELETE',
    display_name: 'Delete customer',
    short_desc: 'Deletes the specified customer',
  },
  {
    path: '/v1/customers/{customer}:GET',
    display_name: 'Retrieve customer',
    short_desc: 'Retrieves the details of an existing customer',
  },
  {
    path: '/v1/customers/{customer}:POST',
    display_name: 'Update customer',
    short_desc: 'Updates the specified customer by setting the values of the parameters passed',
  },
  {
    path: '/v1/customers/{customer}/balance_transactions:GET',
    display_name: 'List balance transactions',
    short_desc:
      'Returns a list of transactions that have contributed to the customers account balance',
  },
  {
    path: '/v1/customers/{customer}/balance_transactions:POST',
    display_name: 'Create balance transaction',
    short_desc: 'Creates a new balance transaction',
  },
  {
    path: '/v1/customers/{customer}/sources:GET',
    display_name: 'List sources',
    short_desc: 'Returns a list of sources for the customer',
  },
  {
    path: '/v1/customers/{customer}/sources:POST',
    display_name: 'Create source',
    short_desc: 'Creates a new source object',
  },
  {
    path: '/v1/customers/{customer}/subscriptions:GET',
    display_name: 'List subscriptions',
    short_desc: 'Returns a list of subscriptions for a customer',
  },
  {
    path: '/v1/customers/{customer}/subscriptions:POST',
    display_name: 'Create subscription',
    short_desc: 'Creates a new subscription on an existing customer',
  },
  {
    path: '/v1/invoices:GET',
    display_name: 'List invoices',
    short_desc: 'Returns a list of your invoices',
  },
  {
    path: '/v1/invoices:POST',
    display_name: 'Create invoice',
    short_desc: 'Creates a draft invoice for a given customer',
  },
  {
    path: '/v1/invoices/{invoice}:DELETE',
    display_name: 'Delete invoice',
    short_desc: 'Deletes the specified invoice',
  },
  {
    path: '/v1/invoices/{invoice}:GET',
    display_name: 'Retrieve invoice',
    short_desc: 'Retrieves the details of an existing invoice',
  },
  {
    path: '/v1/invoices/{invoice}:POST',
    display_name: 'Update invoice',
    short_desc: 'Updates the specified invoice by setting the values of the parameters passed',
  },
  {
    path: '/v1/payment_intents:GET',
    display_name: 'List payment intents',
    short_desc: 'Returns a list of payment intents',
  },
  {
    path: '/v1/payment_intents:POST',
    display_name: 'Create payment intent',
    short_desc: 'Creates a new payment intent',
  },
  {
    path: '/v1/refunds:GET',
    display_name: 'List refunds',
    short_desc: 'Returns a list of all refunds you’ve previously created',
  },
  {
    path: '/v1/refunds:POST',
    display_name: 'Create refund',
    short_desc: 'Creates a new refund object',
  },
]);
