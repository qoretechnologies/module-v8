import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoCustomerFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';

export const MAGENTO_CUSTOMERS_ALLOWED_PATHS = {
  '/V1/customers/search': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoCustomerFieldsAllowedValues),
    },
  },
  '/V1/customers': {
    POST: {},
  },
  '/V1/customers/{customerId}': {
    GET: {
      override_options: {
        customerId: {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        customerId: {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        customerId: {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
