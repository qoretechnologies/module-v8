import { TAllowedPaths, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { getMagentoSearchCriteriaOptions } from './constants';
import { getMagentoInvoiceFieldsAllowedValues } from '../helpers/get-object-fields-allowed-values';
import { getMagentoOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';
import { getMagentoOrderItemIdAllowedValues } from '../helpers/get-order-item-id-allowed-values';

export const MAGENTO_INVOICES_ALLOWED_PATHS = {
  '/V1/invoices': {
    GET: {
      override_options: getMagentoSearchCriteriaOptions(getMagentoInvoiceFieldsAllowedValues),
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
} satisfies TAllowedPaths<TCustomConnOptions>;
