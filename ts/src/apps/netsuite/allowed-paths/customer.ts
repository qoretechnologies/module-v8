import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getNetsuiteCustomerStatusIdAllowedValues } from '../helpers/get-customer-status-allowed-values';
import { getNetsuiteContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getNetsuiteSubsidiaryIdAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';
import { getNetsuiteCurrencyIdAllowedValues } from '../helpers/get-currency-id-allowed-values';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuiteCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';

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

export const NETSUITE_CUSTOMER_ALLOWED_PATHS = {
  '/customer': {
    POST: {
      override_options: customerOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
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
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
