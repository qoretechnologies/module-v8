import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getNetsuiteCustomerEntityIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import {
  getNetsuiteSalesItemIdObjectAllowedValues,
  getNetsuiteSalesItemIdArrayAllowedValues,
} from '../helpers/get-item-id-allowed-values';
import {
  getNetsuiteSalesOrderStatusIdAllowedValues,
  getNetsuiteSalesOrderStatusObjectAllowedValues,
} from '../helpers/get-order-status-id-allowed-values';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';
import { getNetsuiteSalesOrderIdAllowedValues } from '../helpers/get-sales-order-id-allowed-values';

const salesOrderOptions = {
  entity: {
    get_allowed_values: getNetsuiteCustomerEntityIdAllowedValues,
    allowed_values_creatable: true,
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
    preselected: true,
  },
  item: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSalesItemIdArrayAllowedValues,
  },
  'item.items': {
    preselected: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteSalesItemIdObjectAllowedValues,
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
  orderStatus: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSalesOrderStatusObjectAllowedValues,
  },
  'orderStatus.id': {
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSalesOrderStatusIdAllowedValues,
  },
  memo: {
    preselected: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_SALES_ORDER_ALLOWED_PATHS = {
  '/salesOrder': {
    POST: {
      override_options: salesOrderOptions,
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
    },
  },
  '/salesOrder/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
        ...salesOrderOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
