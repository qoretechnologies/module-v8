import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { NetsuiteBaseObjectCreationResponseType } from '../constants';
import { getNetsuiteCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getNetsuiteSalesItemIdAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getNetsuiteSalesOrderStatusIdAllowedValues } from '../helpers/get-order-status-id-allowed-values';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';

export const NETSUITE_SIMPLIFIED_SALES_ORDER_ALLOWED_PATHS = {
  '/salesOrder': {
    POST: {
      response_type: NetsuiteBaseObjectCreationResponseType,
      request_data_converter: (request) => {
        const { entity, item, orderStatus, ...rest } = request;

        const items = item?.map((i: { id: string }) => {
          const { id, ...rest } = i;

          return {
            item: {
              id,
            },
            ...rest,
          };
        });

        return {
          ...rest,
          entity: {
            id: entity,
          },
          item: {
            items,
          },
          orderStatus: {
            id: orderStatus,
          },
        };
      },
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
      override_options: {
        memo: {
          type: 'string',
          required: false,
          preselected: true,
        },
        entity: {
          type: 'softstring',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteCustomerIdAllowedValues,
        },
        orderStatus: {
          type: 'softstring',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSalesOrderStatusIdAllowedValues,
        },
        item: {
          required: true,
          element_allowed_values_creatable: true,
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'softstring',
                  allowed_values_creatable: true,
                  get_allowed_values: getNetsuiteSalesItemIdAllowedValues,
                  required: true,
                },
                amount: {
                  type: 'number',
                  required: true,
                  default_value: 1,
                },
                quantity: {
                  type: 'number',
                  required: false,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TAllowedPaths;
