import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoAttributeSetIdAllowedValues } from '../helpers/get-attribute-set-id-allowed-values';
import {
  getMagentoCartFieldsAllowedValues,
  getMagentoProductFieldsAllowedValues,
} from '../helpers/get-object-fields-allowed-values';
import { getMagentoProductSkuAllowedValues } from '../helpers/get-product-sku-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_PRODUCTS_ALLOWED_PATHS = {
  '/V1/products': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoProductFieldsAllowedValues),
    },
    POST: {
      override_options: {
        product: {
          required: true,
        },
        'product.sku': {
          required: true,
        },
        'product.name': {
          required: true,
        },
        'product.attributes_set_id': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getMagentoAttributeSetIdAllowedValues,
        },
      },
    },
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
        'product.sku': {
          required: false,
          preselected: false,
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
} satisfies TAllowedPaths<TCustomConnOptions>;
