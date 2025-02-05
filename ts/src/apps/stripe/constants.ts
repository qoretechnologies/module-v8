import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { IQoreConnectionOptions } from '@qoretechnologies/ts-toolkit';
import { getStripeAccountIdAllowedValues } from './helpers/get-account-id-allowed-values';
import { getStripeBalanceHistoryIdAllowedValues } from './helpers/get-balance-history-id-allowed-values';
import { getStripeChargeIdAllowedValues } from './helpers/get-charge-id-allowed-values';
import { getStripeCustomerIdAllowedValues } from './helpers/get-customer-id-allovwed-values';
import { getStripeInvoiceIdAllowedValues } from './helpers/get-invoice-id-allowed-values';
import { getStripePaymentIntentIdAllowedValues } from './helpers/get-payment-intent-id-allowed-values';

export const STRIPE_APP_NAME = 'Stripe';
export const STRIPE_ALLOWED_PATHS: TAllowedPaths = {
  '/v1/account': {
    GET: {},
  },
  '/v1/account_links': {
    POST: {},
  },
  '/v1/accounts/{account}': {
    DELETE: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
  },
  '/v1/accounts/{account}/external_accounts': {
    GET: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
  },
  '/v1/accounts/{account}/login_links': {
    POST: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
  },
  '/v1/accounts/{account}/people': {
    GET: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        account: {
          get_allowed_values: getStripeAccountIdAllowedValues,
        },
      },
    },
  },
  '/v1/balance': {
    GET: {},
  },
  '/v1/balance/history': {
    GET: {
      override_options: {
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
  },
  '/v1/balance/history/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeBalanceHistoryIdAllowedValues,
        },
      },
    },
  },
  '/v1/charges': {
    GET: {
      override_options: {
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
    POST: {
      override_options: {
        amount: {
          required: true,
        },
        currency: {
          required: true,
        },
        source: {
          required: true,
        },
      },
    },
  },
  '/v1/charges/{charge}': {
    GET: {
      override_options: {
        charge: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeChargeIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        charge: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeChargeIdAllowedValues,
        },
      },
    },
  },
  '/v1/customers': {
    GET: {
      override_options: {
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
    POST: {
      override_options: {
        email: {
          required: true,
        },
      },
    },
  },
  '/v1/customers/{customer}': {
    DELETE: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
  },
  '/v1/customers/{customer}/balance_transactions': {
    GET: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        amount: {
          required: true,
        },
        currency: {
          required: true,
        },
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
  },
  '/v1/customers/{customer}/sources': {
    GET: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        source: {
          required: true,
        },
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
  },
  '/v1/customers/{customer}/subscriptions': {
    GET: {
      override_options: {
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        billing_cycle_anchor: {
          required: false,
          type: 'unixtsms',
        },
        cancel_at: {
          required: false,
          type: 'unixtsms',
        },
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
        },
      },
    },
  },
  '/v1/invoices': {
    GET: {
      override_options: {
        due_date: {
          required: false,
          type: 'unixtsms',
        },
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
    POST: {
      override_options: {
        effective_at: {
          required: false,
          type: 'unixtsms',
        },
        due_date: {
          required: false,
          type: 'unixtsms',
        },
        customer: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeCustomerIdAllowedValues,
          required: true,
        },
      },
    },
  },
  '/v1/invoices/{invoice}': {
    DELETE: {
      override_options: {
        invoice: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeInvoiceIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        invoice: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeInvoiceIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        effective_at: {
          required: false,
          type: 'unixtsms',
        },
        due_date: {
          required: false,
          type: 'unixtsms',
        },
        invoice: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeInvoiceIdAllowedValues,
        },
      },
    },
  },
  '/v1/payment_intents': {
    GET: {
      override_options: {
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
    POST: {
      override_options: {
        amount: {
          required: true,
        },
        currency: {
          required: true,
        },
        payment_method: {
          required: true,
        },
      },
    },
  },
  '/v1/refunds': {
    GET: {
      override_options: {
        created: {
          required: false,
          type: 'unixtsms',
        },
      },
    },
    POST: {
      override_options: {
        charge: {
          allowed_values_creatable: true,
          get_allowed_values: getStripeChargeIdAllowedValues,
          required_groups: ['refund-group'],
        },
        payment_intent: {
          allowed_values_creatable: true,
          get_allowed_values: getStripePaymentIntentIdAllowedValues,
          required_groups: ['refund-group'],
        },
      },
    },
  },
};
export const STRIPE_CONN_OPTIONS = {
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
  user_id: {
    display_name: 'User ID',
    short_desc: 'The user ID',
    desc: 'The user ID',
    type: 'string',
  },
  stripe_user_id: {
    display_name: 'Stripe User ID',
    short_desc: 'The Stripe user ID',
    desc: 'The Stripe user ID',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;
