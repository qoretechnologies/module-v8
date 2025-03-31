import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import {
  getMagentoCartFieldsAllowedValues,
  getMagentoProductFieldsAllowedValues,
} from '../helpers/get-object-fields-allowed-values';
import { getMagentoProductSkuAllowedValues } from '../helpers/get-product-sku-allowed-values';

export const MAGENTO_PRODUCTS_ALLOWED_PATHS = {
  '/V1/products': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoProductFieldsAllowedValues),
    },
    POST: {},
  },
  '/V1/products/{sku}': {
    GET: {
      override_options: {
        sku: {
          get_allowed_values: getMagentoProductSkuAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        sku: {
          get_allowed_values: getMagentoProductSkuAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        sku: {
          get_allowed_values: getMagentoProductSkuAllowedValues,
        },
      },
    },
  },
  '/V1/carts/search': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoCartFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
