import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoReturnFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getMagentoReturnIdAllowedValues } from '../helpers/get-return-id-allowed-values';

export const MAGENTO_RETURNS_ALLOWED_PATHS = {
  '/V1/returns': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoReturnFieldsAllowedValues),
    },
    POST: {
      override_options: {
        order_id: {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        customer_id: {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
        },
      },
    },
  },
  '/V1/returns/{id}': {
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getMagentoReturnIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
