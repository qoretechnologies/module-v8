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
import { getPaddleProductIdAllowedValues } from '../helpers/get-product-id-allowed-values';
import { PaddleTaxCategoryAllowedValues } from '../helpers/get-product-tax-category-allowed-values';
import { PaddleTypeAllowedValues } from '../helpers/get-type-allowed-values';
import { PaddleStatusAllowedValues } from '../helpers/get-status-allowed-values';
import { PaddleProductOrderByFieldAllowedValues } from '../helpers/get-products-order-by-fields-allowed-values';

const options = {
  include_prices: {
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
  type: {
    type: 'string',
    allowed_values: PaddleTypeAllowedValues,
  },
  tax_category: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: PaddleTaxCategoryAllowedValues,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          allowed_values: PaddleProductOrderByFieldAllowedValues,
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

const listProducts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PADDLE_APP_NAME,
  action: 'list_products',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_type'],
      ErrorClass: PaddleError,
    });

    const includePrices = obj?.include_prices ?? false;
    const after = obj?.after;
    const ids = obj?.ids;
    const perPage = obj?.per_page ? Math.min(obj.per_page, 200) : 50;
    const status = obj?.status as Status | undefined;
    const type = obj?.type as CatalogType | undefined;
    const taxCategory = obj?.tax_category;
    const sortOrder = obj?.order?.direction || 'ASC';
    const sortField = obj?.order?.field || 'created_at';

    try {
      const client = createPaddleClient(token, instance_type);

      const productsCollection = client.products.list({
        ...(includePrices && { include: ['prices'] }),
        ...(after && { after }),
        ...(ids && { id: ids }),
        ...(perPage && { per_page: perPage }),
        ...(status && { status: [status] }),
        ...(type && { type: [type] }),
        ...(taxCategory && { tax_category: taxCategory }),
        orderBy: `${sortField}[${sortOrder}]`,
      });

      return await productsCollection.next();
    } catch (error) {
      throw new PaddleError(`Failed to list products: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
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
              },
            },
          },
        },
        customData: { type: 'hash' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    },
  } satisfies TQoreResponseType,
});

export default listProducts;
