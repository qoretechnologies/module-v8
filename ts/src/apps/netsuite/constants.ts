import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths } from '../../global/models/qore';
import netsuite from '../../schemas/netsuite.swagger.json';
import { IQoreConnectionOptions } from '../zendesk';
import { getNetsuiteAccountIdAllowedValues } from './helpers/get-account-id-allowed-values';
import { getNetsuiteCustomerIdAllowedValues } from './helpers/get-customer-id-allowed-values';
import { getNetsuiteInvoiceIdAllowedValues } from './helpers/get-invoice-id-allowed-values';
import { getNetsuiteJournalEntryIdAllowedValues } from './helpers/get-journal-entry-id-allowed-values';
import { getNetsuitePurchaseOrderIdAllowedValues } from './helpers/get-purchase-order-id-allowed-values';
import { getNetsuiteSalesOrderIdAllowedValues } from './helpers/get-sales-order-id-allowed-values';
import { getNetsuitevendorIdAllowedValues } from './helpers/get-vendor-id-allowed-values';

export const NETSUITE_APP_NAME = 'NetSuite';

export const NETSUITE_CONN_OPTIONS = {
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;

export const NETSUITE_ALLOWED_PATHS = {
  '/account': {
    GET: {},
    POST: {},
  },
  '/account/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
  },
  '/customer': {
    GET: {},
    POST: {},
  },
  '/customer/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
      },
    },
  },
  '/salesOrder': {
    GET: {},
    POST: {},
  },
  '/salesOrder/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
  },
  '/invoice': {
    GET: {},
    POST: {},
  },
  '/invoice/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
      },
    },
  },
  '/vendor': {
    GET: {},
    POST: {},
  },
  '/vendor/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
      },
    },
  },
  '/purchaseOrder': {
    GET: {},
    POST: {},
  },
  '/purchaseOrder/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
  },
  '/journalEntry': {
    GET: {},
    POST: {},
  },
  '/journalEntry/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const NETSUITE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: netsuite as any,
  allowedPaths: NETSUITE_ALLOWED_PATHS,
  app: NETSUITE_APP_NAME,
});
