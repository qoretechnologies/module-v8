import { CatalogType, Status } from '@paddle/paddle-node-sdk';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { PADDLE_APP_NAME, PADDLE_INSTANCE_TYPE, PaddleError } from '../constants';
import { createPaddleClient } from '../helpers/constants';
import { PaddleTaxCategoryAllowedValues } from '../helpers/get-product-tax-category-allowed-values';
import { PaddleStatusAllowedValues } from '../helpers/get-status-allowed-values';
import { PaddleTypeAllowedValues } from '../helpers/get-type-allowed-values';

const PaddleNewProductTrigger = QoreAppCreator.createLocalizedTrigger({
  app: PADDLE_APP_NAME,
  action: 'new_product',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    include_prices: {
      type: 'bool',
      default_value: false,
    },
    status: {
      type: 'string',
      required: false,
      allowed_values: PaddleStatusAllowedValues,
    },
    type: {
      type: 'string',
      required: false,
      allowed_values: PaddleTypeAllowedValues,
    },
    tax_category: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: PaddleTaxCategoryAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { include_prices, status, type, tax_category } = context.opts || {};

    const getItems = () => {
      return fetchLatestProducts({
        token,
        instance_type,
        include_prices,
        status: status as Status | undefined,
        type: type as CatalogType | undefined,
        tax_category,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'paddle_new_product',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const { include_prices, status, type, tax_category } = context.opts || {};

    const products = await fetchLatestProducts({
      token,
      instance_type,
      include_prices,
      status: status as Status | undefined,
      type: type as CatalogType | undefined,
      tax_category,
    });

    return products?.length > 0 ? products[0] : null;
  },
  event_info: {
    desc: 'Paddle New Product Trigger Event Info',
    type: {
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
                      requiresPaymentMethod: { type: 'bool' },
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
    },
  },
});

export default PaddleNewProductTrigger;

const fetchLatestProducts = async (options: {
  token: string;
  instance_type: (typeof PADDLE_INSTANCE_TYPE)[keyof typeof PADDLE_INSTANCE_TYPE];
  include_prices?: boolean;
  status?: Status;
  type?: CatalogType;
  tax_category?: string[];
}) => {
  const { token, instance_type, include_prices, status, type, tax_category } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createPaddleClient(token, instance_type);

    const productsCollection = client.products.list({
      perPage: limit,
      orderBy: 'created_at[DESC]',
      ...(include_prices && { include: ['prices'] }),
      ...(status && { status: [status] }),
      ...(type && { type: [type] }),
      ...(tax_category && { tax_category }),
    });

    const result = await productsCollection.next();

    return result || [];
  } catch (error) {
    throw new PaddleError(`Failed to fetch latest products: ${error.message || error}`);
  }
};
