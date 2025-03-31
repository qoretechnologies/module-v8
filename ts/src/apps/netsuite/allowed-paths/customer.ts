import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { getNetsuiteContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getNetsuiteCurrencyObjectAllowedValues } from '../helpers/get-currency-id-allowed-values';
import { getNetsuiteCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getNetsuiteCustomerStatusObjectAllowedValues } from '../helpers/get-customer-status-allowed-values';
import { getNetsuiteSubsidiaryObjectAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';

const customerOptions = {
  currency: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyObjectAllowedValues,
  },
  'currencyList.items.currency': {
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteCurrencyObjectAllowedValues,
  },
  subsidiary: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryObjectAllowedValues,
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
    get_allowed_values: getNetsuiteCustomerStatusObjectAllowedValues,
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
