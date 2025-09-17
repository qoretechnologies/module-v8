import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyCreateFulfillmentResponseType } from './response-types/create-fulfillment.response';
import { getShopifyFulfillmentOrderLineItemIdAllowedValues } from '../helpers/get-fulfillment-order-item-id-allowed-values';
import { getShopifyFulfillmentOrderIdAllowedValues } from '../helpers/get-fulfillment-order-id-allowed-values';

const FulfillmentOrderLineItemInputType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      required: true,
      get_allowed_values: getShopifyFulfillmentOrderLineItemIdAllowedValues,
    },
    quantity: {
      type: 'int',
      required: true,
    },
  },
} satisfies TQoreTypeObject;

const FulfillmentTrackingInputType = {
  type: 'hash',
  fields: {
    number: {
      type: 'string',
      required: false,
    },
    url: {
      type: 'string',
      required: false,
    },
    company: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const FulfillmentOriginAddressInputType = {
  type: 'hash',
  fields: {
    address1: {
      type: 'string',
      required: false,
    },
    address2: {
      type: 'string',
      required: false,
    },
    city: {
      type: 'string',
      required: false,
    },
    countryCode: {
      type: 'string',
      required: true,
    },
    provinceCode: {
      type: 'string',
      required: false,
    },
    zip: {
      type: 'string',
      required: false,
    },
  },
} satisfies TQoreTypeObject;

const options = {
  fulfillmentOrderId: {
    type: 'string',
    required: true,
    get_allowed_values: getShopifyFulfillmentOrderIdAllowedValues,
  },
  fulfillmentOrderLineItems: {
    type: {
      type: 'list',
      element_type: FulfillmentOrderLineItemInputType,
    },
    depends_on: ['fulfillmentOrderId'],
    required: false,
    preselected: true,
  },
  notifyCustomer: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  trackingInfo: {
    type: FulfillmentTrackingInputType,
    required: false,
  },
  originAddress: {
    type: FulfillmentOriginAddressInputType,
    required: false,
  },
  message: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

type TCreateFulfillmentInput = {
  lineItemsByFulfillmentOrder: Array<{
    fulfillmentOrderId: string;
    fulfillmentOrderLineItems?: Array<{
      id: string;
      quantity: number;
    }>;
  }>;
  notifyCustomer?: boolean;
  trackingInfo?: {
    number?: string;
    url?: string;
    company?: string;
  };
  originAddress?: {
    address1?: string;
    address2?: string;
    city?: string;
    countryCode: string;
    provinceCode?: string;
    zip?: string;
  };
  message?: string;
};

const createFulfillment = async (
  context: TShopifyContextWithConn,
  data: TCreateFulfillmentInput
) => {
  const createFulfillmentMutation = `
    mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!, $message: String) {
      fulfillmentCreateV2(fulfillment: $fulfillment, message: $message) {
        fulfillment {
          id
          status
          createdAt
          updatedAt
          estimatedDeliveryAt
          deliveredAt
          displayStatus
          fulfillmentLineItems(first: 50) {
            edges {
              node {
                id
                lineItem {
                  id
                  title
                  quantity
                  sku
                  requiresShipping
                  taxable
                  variant {
                    id
                    title
                    sku
                    price
                  }
                  product {
                    id
                    title
                  }
                }
                quantity
                originalTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          location {
            id
            name
            address {
              address1
              address2
              city
              provinceCode
              countryCode
              zip
            }
          }
          service {
            handle
          }
          trackingInfo(first: 10) {
            company
            number
            url
          }
          originAddress {
            address1
            address2
            city
            countryCode
            provinceCode
            zip
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const fulfillment: Record<string, any> = {
    lineItemsByFulfillmentOrder: data.lineItemsByFulfillmentOrder,
  };

  if (data.notifyCustomer !== undefined) {
    fulfillment.notifyCustomer = data.notifyCustomer;
  }

  if (data.trackingInfo) {
    fulfillment.trackingInfo = data.trackingInfo;
  }

  if (data.originAddress) {
    fulfillment.originAddress = data.originAddress;
  }

  const variables = {
    fulfillment,
    message: data.message,
  };

  const createFulfillmentResult = await executeShopifyGraphQL(
    context,
    createFulfillmentMutation,
    variables
  );

  const userErrors = createFulfillmentResult.data?.fulfillmentCreateV2?.userErrors || [];
  if (userErrors.length > 0) {
    const errors = userErrors.map((err: { message: string }) => err.message).join('; ');
    throw new ShopifyError(`Failed to create fulfillment: ${errors}`);
  }

  return createFulfillmentResult.data.fulfillmentCreateV2;
};

const CreateShopifyFulfillment = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-fulfillment',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const { fulfillmentOrderId } = data || {};
    const lineItems = (data?.fulfillmentOrderLineItems || []) as Array<{
      id: string;
      quantity: number;
    }>;
    const lineItemsByFulfillmentOrder: TCreateFulfillmentInput['lineItemsByFulfillmentOrder'] = [];

    try {
      if (!fulfillmentOrderId) {
        throw new ShopifyError('Fulfillment order ID is required');
      }

      const formattedLineItems = lineItems.map(
        (
          lineItem: { id: string; quantity: number },
          lineItemIndex: number
        ): {
          id: string;
          quantity: number;
        } => {
          if (!lineItem.id) {
            throw new ShopifyError(
              `Line item at index ${lineItemIndex} for fulfillment order must have an id`
            );
          }
          if (!lineItem.id.includes('gid://shopify/'))
            lineItem.id = `gid://shopify/FulfillmentOrderLineItem/${lineItem.id}`;
          if (!lineItem.quantity || lineItem.quantity <= 0) {
            throw new ShopifyError(
              `Line item at index ${lineItemIndex} for fulfillment order ` +
                `must have a quantity greater than 0`
            );
          }

          return {
            id: lineItem.id,
            quantity: lineItem.quantity,
          };
        }
      );

      lineItemsByFulfillmentOrder[0] = {
        fulfillmentOrderId: fulfillmentOrderId.includes('gid://shopify/')
          ? fulfillmentOrderId
          : `gid://shopify/FulfillmentOrder/${fulfillmentOrderId}`,
        ...(lineItems?.length
          ? {
              fulfillmentOrderLineItems: formattedLineItems,
            }
          : {}),
      };

      const input = { ...data, lineItemsByFulfillmentOrder } as TCreateFulfillmentInput;
      const result = await createFulfillment(context as TShopifyContextWithConn, input);

      return transformShopifyResponse(result);
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to create Shopify fulfillment: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyCreateFulfillmentResponseType,
});

export default CreateShopifyFulfillment;
