import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import magento from '../../schemas/magento.swagger.json';
import { getMagentoOrderIdAllowedValues } from './helpers/get-order-id-allowed-values';
import { getMagentoReturnIdAllowedValues } from './helpers/get-return-id-allowed-values';
import {
  getMagentoCustomerEmailAllowedValues,
  getMagentoCustomerIdAllowedValues,
} from './helpers/get-customer-id-allowed-values';
import {
  getMagentoProductSkuAllowedValues,
  getMagentoProductSkuObjectAllowedValues,
} from './helpers/get-product-sku-allowed-values';
import {
  getMagentoCartFieldsAllowedValues,
  getMagentoCustomerFieldsAllowedValues,
  getMagentoInvoiceFieldsAllowedValues,
  getMagentoOrderFieldsAllowedValues,
  getMagentoProductFieldsAllowedValues,
  getMagentoReturnFieldsAllowedValues,
  getMagentoShipmentFieldsAllowedValues,
  getMagentoTransactionFieldsAllowedValues,
} from './helpers/get-object-fields-allowed-values';
import { MagentoConditionTypeAllowedValues } from './helpers/condition-type-allowed-values';
import { getMagentoOrderItemIdAllowedValues } from './helpers/get-order-item-id-allowed-values';

export const MAGENTO_CONN_OPTIONS = {
  instance_url: {
    type: 'string',
    desc: 'The url of the Magento instance',
  },
  username: {
    type: 'string',
    desc: 'The username of the Magento account',
  },
  password: {
    type: 'string',
    desc: 'The password of the Magento account',
  },
} satisfies TCustomConnOptions;
export const MAGENTO_APP_NAME = 'Magento';
export const MAGENTO_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTI5LjE2IDEzMzMuMzMiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02MzguOTEgMzk5Ljkzdjc1OS41bC03NC42OSA0NS42NS03NC43NS00NS44OVY0MDAuNTJMMjk1LjkzIDUxOS42OHY2NDkuNTFsMjY4LjI4IDE2NC4xNSAyNzAuNTUtMTY1LjMyVjUxOS4yN0w2MzguODkgMzk5Ljk0ek01NjQuMjIgMEwwIDM0MS44NHY2NDkuNTlsMTQ2LjU0IDg2LjMzVjQyOC4xMWw0MTcuOC0yNTQuMDQgNDE4LjE5IDI1My42NyAxLjcyLjk4LS4xOSA2NDguMDcgMTQ1LjEtODUuMzZWMzQxLjg0TDU2NC4yMyAweiIgZmlsbD0iI2YyNjMyMiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9zdmc+';

const getSearchCriteriaOptions = (
  getFieldsAllowedValues: TQoreGetAllowedValuesFunction<TCustomConnOptions, string>
) => ({
  'searchCriteria[filterGroups][0][filters][0][field]': {
    allowed_values_creatable: true,
    get_allowed_values: getFieldsAllowedValues,
  },
  'searchCriteria[filterGroups][0][filters][0][conditionType]': {
    allowed_values: MagentoConditionTypeAllowedValues,
  },
  'searchCriteria[sortOrders][0][direction]': {
    allowed_values: [
      { value: 'ASC', display_name: 'Ascending' },
      { value: 'DESC', display_name: 'Descending' },
    ],
  },
  'searchCriteria[sortOrders][0][field]': {
    allowed_values_creatable: true,
    get_allowed_values: getFieldsAllowedValues,
  },
});

export const MAGENTO_ALLOWED_PATHS = {
  '/V1/orders': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoOrderFieldsAllowedValues),
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
        'enity.payment': {
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
  '/V1/invoices': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoInvoiceFieldsAllowedValues),
    },
    POST: {
      override_options: {
        'entity.order_id': {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        'entity.items.sku': {
          required: false,
        },
        'entity.items.qty': {
          required: false,
        },
        'entity.items.order_item_id': {
          depends_on: ['entity.order_id'],
          get_allowed_values: getMagentoOrderItemIdAllowedValues,
        },
      },
    },
  },
  '/V1/shipments': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoShipmentFieldsAllowedValues),
    },
    POST: {
      override_options: {
        'entity.order_id': {
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        'entity.items.sku': {
          required: false,
        },
        'entity.items.qty': {
          required: false,
        },
        'entity.items.order_item_id': {
          depends_on: ['entity.order_id'],
          get_allowed_values: getMagentoOrderItemIdAllowedValues,
        },
        'enity.tracks': {
          required: false,
        },
        'entity.comments': {
          required: false,
        },
      },
    },
  },
  '/V1/transactions': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoTransactionFieldsAllowedValues),
    },
  },
  '/V1/returns': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoReturnFieldsAllowedValues),
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
  '/V1/customers/search': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoCustomerFieldsAllowedValues),
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
  '/V1/products': {
    GET: {
      override_options: getSearchCriteriaOptions(getMagentoProductFieldsAllowedValues),
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
      override_options: getSearchCriteriaOptions(getMagentoCartFieldsAllowedValues),
    },
  },
} satisfies TAllowedPaths;

export const MAGENTO_ACTIONS = buildActionsFromSwaggerSchema({
  schema: magento,
  allowedPaths: MAGENTO_ALLOWED_PATHS,
  app: MAGENTO_APP_NAME,
});
