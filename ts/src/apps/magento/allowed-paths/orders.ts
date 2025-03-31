import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoOrderFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import {
  getMagentoCustomerEmailAllowedValues,
  getMagentoCustomerIdAllowedValues,
} from '../helpers/get-customer-id-allowed-values';
import { getMagentoProductSkuObjectAllowedValues } from '../helpers/get-product-sku-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';

export const MAGENTO_ORDERS_ALLOWED_PATHS = {
  '/V1/orders': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoOrderFieldsAllowedValues),
    },
  },
  '/V1/orders/create': {
    PUT: {
      override_options: {
        'entity.customer_id': {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
        },
        'entity.customer_email': {
          get_allowed_values: getMagentoCustomerEmailAllowedValues,
        },
        'entity.items': {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getMagentoProductSkuObjectAllowedValues,
        },
        'entity.payment': {
          required: true,
        },
        'entity.payment.method': {
          required: true,
          allowed_values_creatable: true,
          allowed_values: [
            { value: 'checkmo', display_name: 'Check / Money order' },
            { value: 'banktransfer', display_name: 'Bank Transfer' },
            { value: 'cashondelivery', display_name: 'Cash on Delivery' },
            { value: 'free', display_name: 'Free' },
            { value: 'purchaseorder', display_name: 'Purchase Order' },
          ],
        },
      },
    },
  },
  '/V1/orders/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
      },
    },
  },
  '/V1/orders/{id}/comments': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        id: {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        'statusHistory.parent_id': {
          required: false,
        },
        'statusHistory.is_visible_on_front': {
          required: false,
        },
        'statusHistory.is_customer_notified': {
          required: false,
        },
        'statusHistory.comment': {
          required: true,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
