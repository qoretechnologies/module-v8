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

const options = {
  price_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddlePriceIdAllowedValues,
  },
  include_product: {
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const getPrice = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_price',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, price_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['price_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const includeProduct = obj?.include_product ?? false;

    try {
      const client = createPaddleClient(token, instance_type);

      const price = await client.prices.get(price_id, {
        ...(includeProduct && { include: ['product'] }),
      });

      return price;
    } catch (error) {
      throw new PaddleError(`Failed to get price: ${error.message || error}`);
    }
  },
  response_type: {
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
  } satisfies TQoreResponseType,
});

export default getPrice;
