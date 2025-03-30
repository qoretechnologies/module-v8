import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { getNetsuiteCurrencyIdAllowedValues } from '../helpers/get-currency-id-allowed-values';
import { getNetsuiteCustomerEntityIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import {
  getNetsuiteSalesItemIdObjectAllowedValues,
  getNetsuiteSalesItemIdArrayAllowedValues,
} from '../helpers/get-item-id-allowed-values';
import { getNetsuiteSubsidiaryIdAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuiteInvoiceIdAllowedValues } from '../helpers/get-invoice-id-allowed-values';

const invoiceOptions = {
  currency: {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  subsidiary: {
    preselected: true,
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
  item: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSalesItemIdArrayAllowedValues,
  },
  'item.items': {
    preselected: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteSalesItemIdObjectAllowedValues,
  },
  'item.items.item': {
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_INVOICE_ALLOWED_PATHS = {
  '/invoice': {
    POST: {
      override_options: invoiceOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
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
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
