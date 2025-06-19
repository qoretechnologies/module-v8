import { CatalogType, Status } from '@paddle/paddle-node-sdk';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { getPaddlePriceIdAllowedValues } from '../helpers/get-price-id-allowed-values';
import { PaddlePricesOrderByFieldsAllowedValues } from '../helpers/get-prices-order-by-fields-allowed-values';
import { getPaddleProductIdAllowedValues } from '../helpers/get-product-id-allowed-values';
import { PaddleStatusAllowedValues } from '../helpers/get-status-allowed-values';
import { PaddleTypeAllowedValues } from '../helpers/get-type-allowed-values';

const options = {
  include_product: {
    type: 'boolean',
    default_value: false,
  },
  after: {
    type: 'string',
    required: false,
  },
  ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddlePriceIdAllowedValues,
    required: false,
  },
  product_ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getPaddleProductIdAllowedValues,
    required: false,
  },
  per_page: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  status: {
    type: 'string',
    allowed_values: PaddleStatusAllowedValues,
    required: false,
  },
  recurring: {
    type: 'boolean',
    default_value: false,
    required: false,
  },
  type: {
    type: 'string',
    allowed_values: PaddleTypeAllowedValues,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: PaddlePricesOrderByFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          allowed_values: [
            { value: 'ASC', display_name: 'Ascending' },
            { value: 'DESC', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listPrices = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_prices',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const includeProduct = obj?.include_product ?? false;
    const recurring = obj?.recurring ?? false;
    const after = obj?.after;
    const ids = obj?.ids;
    const productIds = obj?.product_ids;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const status = obj?.status as Status | undefined;
    const type = obj?.type as CatalogType | undefined;
    const sortOrder = obj?.order?.direction || 'ASC';
    const sortField = obj?.order?.field || 'created_at';

    try {
      const client = createPaddleClient(token, instance_type);

      const pricesCollection = client.prices.list({
        ...(includeProduct && { include: ['product'] }),
        ...(after && { after }),
        ...(ids && { id: ids }),
        ...(perPage && { per_page: perPage }),
        ...(status && { status: [status] }),
        ...(type && { type: [type] }),
        ...(recurring && { recurring }),
        ...(productIds && { productId: productIds }),
        orderBy: `${sortField}[${sortOrder}]`,
      });

      return await pricesCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list prices: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        productId: { type: 'integer' },
        type: { type: 'string' },
        description: { type: 'string' },
        name: { type: 'string' },
        billingCycle: {
          type: {
            type: 'hash',
            fields: {
              interval: { type: 'string' },
              frequency: { type: 'integer' },
            },
          },
        },
        trialPeriod: {
          type: {
            type: 'hash',
            fields: {
              interval: { type: 'string' },
              frequency: { type: 'integer' },
              requiresPaymentMethod: { type: 'boolean' },
            },
          },
        },
        taxMode: { type: 'string' },
        unitPrice: {
          type: {
            type: 'hash',
            fields: {
              amount: { type: 'number' },
              currencyCode: { type: 'string' },
            },
          },
        },
        unitPriceOverrides: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                countryCodes: {
                  type: {
                    type: 'list',
                    element_type: 'string',
                  },
                },
                unitPrice: {
                  type: {
                    type: 'hash',
                    fields: {
                      amount: { type: 'number' },
                      currencyCode: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        customData: { type: 'hash' },
        status: { type: 'string' },
        quantity: {
          type: {
            type: 'hash',
            fields: {
              minimum: { type: 'integer' },
              maximum: { type: 'integer' },
            },
          },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        product: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'integer' },
              name: { type: 'string' },
              taxCategory: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string' },
              status: { type: 'string' },
              imageUrl: { type: 'string' },
              customData: { type: 'hash' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default listPrices;
