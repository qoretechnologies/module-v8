import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import {
  getMagentoCustomerEmailAllowedValues,
  getMagentoCustomerIdAllowedValues,
} from '../helpers/get-customer-id-allowed-values';
import { getMagentoOrderFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoProductSkuObjectAllowedValues } from '../helpers/get-product-sku-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_ORDERS_ALLOWED_PATHS = {
  '/V1/orders': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoOrderFieldsAllowedValues),
    },
  },
  '/V1/orders/create': {
    PUT: {
      override_options: {
        customer_id: {
          get_allowed_values: getMagentoCustomerIdAllowedValues,
          required: false,
          preselected: true,
          type: 'softstring',
          required_groups: ['order_customer'],
        },
        customer_email: {
          required_groups: ['order_customer'],
          allowed_values_creatable: true,
          preselected: true,
          required: false,
          get_allowed_values: getMagentoCustomerEmailAllowedValues,
        },
        items: {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getMagentoProductSkuObjectAllowedValues,
        },
        payment: {
          required: true,
        },
        'payment.cc_last4': {
          required: false,
        },
        'payment.method': {
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
          type: 'softstring',
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
      },
    },
  },
  '/V1/orders/{id}/comments': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        parent_id: {
          required: false,
        },
        is_visible_on_front: {
          required: false,
        },
        is_customer_notified: {
          required: false,
        },
        comment: {
          required: true,
        },
      },
    },
  },
} satisfies TAllowedPaths<TCustomConnOptions>;
