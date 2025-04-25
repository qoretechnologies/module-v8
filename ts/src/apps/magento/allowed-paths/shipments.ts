import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoShipmentFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoOrderItemIdAllowedValues } from '../helpers/get-order-item-id-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_SHIPMENTS_ALLOWED_PATHS = {
  '/V1/shipments': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoShipmentFieldsAllowedValues),
    },
  },
  '/V1/shipment': {
    POST: {
      override_options: {
        order_id: {
          type: 'softstring',
          get_allowed_values: getMagentoOrderIdAllowedValues,
        },
        'items.sku': {
          required: false,
        },
        'items.qty': {
          required: false,
        },
        'items.order_item_id': {
          depends_on: ['order_id'],
          get_allowed_values: getMagentoOrderItemIdAllowedValues,
        },
        tracks: {
          required: false,
        },
        comments: {
          required: false,
        },
      },
    },
  },
} satisfies TAllowedPaths<TCustomConnOptions>;
