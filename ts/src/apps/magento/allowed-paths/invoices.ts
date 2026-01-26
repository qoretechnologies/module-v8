import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoInvoiceFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoOrderItemIdAllowedValues } from '../helpers/get-order-item-id-allowed-values';
import { getMagentoSearchCriteriaOptions } from './constants';

export const MAGENTO_INVOICES_ALLOWED_PATHS = {
  '/V1/invoices': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoInvoiceFieldsAllowedValues),
    },
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
          depends_on: ['entity.order_id'],
          type: 'softstring',
          get_allowed_values: getMagentoOrderItemIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<TCustomConnOptions>;
