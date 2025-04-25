import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getMagentoCustomerFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_CUSTOMERS_ALLOWED_PATHS = {
  '/V1/customers/search': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoCustomerFieldsAllowedValues),
    },
  },
  '/V1/customers': {
    POST: {
      override_options: {
        customer: {
          required: true,
        },
        'customer.email': {
          required: true,
        },
        'customer.firstname': {
          required: true,
        },
        'customer.lastname': {
          required: true,
        },
      },
    },
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
        'customer.email': {
          required: false,
          preselected: true,
        },
        'customer.firstname': {
          required: false,
          preselected: true,
        },
        'customer.lastname': {
          required: false,
          preselected: true,
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
} satisfies TAllowedPaths<TCustomConnOptions>;
