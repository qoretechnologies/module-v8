import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { PADDLE_APP_NAME, PaddleError } from '../../constants';
import { getPaddleProductIdAllowedValues } from '../../helpers/get-product-id-allowed-values';
import { createPaddleClient } from '../../helpers/constants';

const options = {
  product_id: {
    type: 'string',
    required: true,
    get_allowed_values: getPaddleProductIdAllowedValues,
  },
  include_prices: {
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const getProduct = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'get_product',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type, product_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['product_id'],
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const includePrices = obj?.include_prices ?? false;

    try {
      const client = createPaddleClient(token, instance_type);

      const product = await client.products.get(product_id, {
        ...(includePrices && { include: ['prices'] }),
      });

      return product;
    } catch (error) {
      throw new PaddleError(`Failed to get product: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      taxCategory: { type: 'string' },
      type: { type: 'string' },
      description: { type: 'string' },
      status: { type: 'string' },
      imageUrl: { type: 'string' },
      prices: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              productId: { type: 'string' },
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
            },
          },
        },
      },
      customData: { type: 'hash' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default getProduct;
