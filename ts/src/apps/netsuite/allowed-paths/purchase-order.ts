import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import {
  getNetsuitePurchaseOrderStatusIdAllowedValues,
  getNetsuitePurchaseOrderStatusObjectAllowedValues,
} from '../helpers/get-order-status-id-allowed-values';
import { getNetsuiteVendorObjectAllowedValues } from '../helpers/get-vendor-id-allowed-values';
import {
  getNetsuitePurchaseItemIdAllowedValues,
  getNetsuitePurchaseItemIdArrayAllowedValues,
} from '../helpers/get-item-id-allowed-values';
import { getNetsuiteCurrencyObjectAllowedValues } from '../helpers/get-currency-id-allowed-values';
import { getNetsuiteEmployeeObjectAllowedValues } from '../helpers/get-employee-id-allowed-values';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuitePurchaseOrderIdAllowedValues } from '../helpers/get-purchase-order-id-allowed-values';

const purchaseOrderOptions = {
  employee: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteEmployeeObjectAllowedValues,
  },
  memo: {
    preselected: true,
  },
  currency: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyObjectAllowedValues,
  },
  item: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuitePurchaseItemIdArrayAllowedValues,
  },
  'item.items': {
    preselected: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuitePurchaseItemIdAllowedValues,
  },
  'item.items.item': {
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
  },
  'item.items.quantity': {
    preselected: true,
  },
  'item.items.amount': {
    preselected: true,
  },
  entity: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteVendorObjectAllowedValues,
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
  },
  orderStatus: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuitePurchaseOrderStatusObjectAllowedValues,
  },
  'orderStatus.id': {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuitePurchaseOrderStatusIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_PURCHASE_ORDER_ALLOWED_PATHS = {
  '/purchaseOrder': {
    POST: {
      override_options: purchaseOrderOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
    },
  },
  '/purchaseOrder/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
        ...purchaseOrderOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuitePurchaseOrderIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
