import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoShipmentFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoOrderItemIdAllowedValues } from '../helpers/get-order-item-id-allowed-values';

export const MAGENTO_SHIPMENTS_ALLOWED_PATHS = {
  '/V1/shipments': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoShipmentFieldsAllowedValues),
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
        'entity.tracks': {
          required: false,
        },
        'entity.comments': {
          required: false,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof MAGENTO_CONN_OPTIONS>;
