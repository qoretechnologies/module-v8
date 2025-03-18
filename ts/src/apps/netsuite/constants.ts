import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import netsuite from '../../schemas/netsuite.swagger.json';
import { getNetsuiteAccountIdAllowedValues } from './helpers/get-account-id-allowed-values';
import {
  getNetsuiteCustomerEntityIdAllowedValues,
  getNetsuiteCustomerIdAllowedValues,
} from './helpers/get-customer-id-allowed-values';
import { getNetsuiteInvoiceIdAllowedValues } from './helpers/get-invoice-id-allowed-values';
import { getNetsuiteJournalEntryIdAllowedValues } from './helpers/get-journal-entry-id-allowed-values';
import { getNetsuitePurchaseOrderIdAllowedValues } from './helpers/get-purchase-order-id-allowed-values';
import { getNetsuiteSalesOrderIdAllowedValues } from './helpers/get-sales-order-id-allowed-values';
import { getNetsuitevendorIdAllowedValues } from './helpers/get-vendor-id-allowed-values';
import { getNetsuiteContactIdAllowedValues } from './helpers/get-contact-id-allowed-values';
import {
  getNetsuiteSubsidiaryIdAllowedValues,
  getNetsuiteSubsidiaryIdArrayAllowedValues,
} from './helpers/get-subsidiary-id-allowed-values';
import { getNetsuiteCurrencyIdAllowedValues } from './helpers/get-currency-id-allowed-values';
import { getNetsuiteCustomerStatusIdAllowedValues } from './helpers/get-customer-status-allowed-values';
import { getNetsuiteAccountTypeAllowedValues } from './helpers/get-account-type-allowed-values';
import { getNetsuiteOpportunityIdAllowedValues } from './helpers/get-opportunity-id-allowed-values';

export const NETSUITE_APP_NAME = 'NetSuite';

export const NETSUITE_CONN_OPTIONS = {
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
  company: {
    display_name: 'Company',
    short_desc: 'The company',
    desc: 'The company',
    type: 'string',
  },
  oauth2_token_url: {
    display_name: 'OAuth2 Token URL',
    short_desc: 'The custom OAuth2 token URL',
    desc: 'The OAuth2 token URL',
    type: 'string',
  },
} satisfies TCustomConnOptions;

const customerOptions = {
  currency: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  currencyList: {
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  subsidiary: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
  contact: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteContactIdAllowedValues,
  },
  contactList: {
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteContactIdAllowedValues,
  },
  entityStatus: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCustomerStatusIdAllowedValues,
  },
  companyName: {
    preselected: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

const contactOptions = {
  subsidiary: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

const accountOptions = {
  currency: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  subsidiary: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdArrayAllowedValues,
  },
  'subsidiary.items': {
    preselected: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
  acctType: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteAccountTypeAllowedValues,
  },
  acctName: {
    preselected: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

const invoiceOptions = {
  currency: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  subsidiary: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
  entity: {
    get_allowed_values: getNetsuiteCustomerEntityIdAllowedValues,
    allowed_values_creatable: true,
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
    preselected: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

const opportunityOptions = {
  title: {
    preselected: true,
  },
  entity: {
    get_allowed_values: getNetsuiteCustomerEntityIdAllowedValues,
    allowed_values_creatable: true,
    preselected: true,
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
  },
  status: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCustomerStatusIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

const vendorOptions = {
  subsidiary: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_ALLOWED_PATHS = {
  '/account': {
    GET: {},
    POST: {
      override_options: accountOptions,
    },
  },
  '/account/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
        ...accountOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
  },
  '/customer': {
    GET: {},
    POST: {
      override_options: customerOptions,
    },
  },
  '/customer/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
        ...customerOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
      },
    },
  },
  '/opportunity': {
    GET: {},
    POST: {
      override_options: opportunityOptions,
    },
  },
  '/opportunity/{id}': {
    GET: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
        ...opportunityOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/contact': {
    POST: {
      override_options: contactOptions,
    },
  },
  '/contact/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
        ...contactOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
      },
    },
  },
  '/salesOrder': {
    POST: {},
  },
  '/salesOrder/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
  },
  '/invoice': {
    POST: {
      override_options: invoiceOptions,
    },
  },
  '/invoice/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
        ...invoiceOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteInvoiceIdAllowedValues,
        },
      },
    },
  },
  '/vendor': {
    POST: {
      override_options: vendorOptions,
    },
  },
  '/vendor/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
        ...vendorOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitevendorIdAllowedValues,
        },
      },
    },
  },
  '/purchaseOrder': {
    POST: {},
  },
  '/purchaseOrder/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
  },
  '/journalEntry': {
    POST: {},
  },
  '/journalEntry/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteJournalEntryIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
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
