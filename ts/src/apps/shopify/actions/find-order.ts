import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyFindOrderResponseType } from './response-types/find-order-response';

const options = {
  nameQuery: {
    type: 'string',
    required: false,
  },
  confirmationQuery: {
    type: 'string',
    required: false,
  },
  emailQuery: {
    type: 'string',
    required: false,
  },
  customerIdQuery: {
    type: 'string',
    required: false,
  },
  locationIdQuery: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
  },
  skuQuery: {
    type: 'string',
    required: false,
  },
  orderIdQuery: {
    type: 'string',
    required: false,
  },
  sortKey: {
    type: 'string',
    required: false,
    default_value: 'CREATED_AT',
    allowed_values_creatable: true,
    allowed_values: [
      {
        value: 'CREATED_AT',
        display_name: 'Created At',
      },
      {
        value: 'UPDATED_AT',
        display_name: 'Updated At',
      },
      {
        value: 'PROCESSED_AT',
        display_name: 'Processed At',
      },
      {
        value: 'TOTAL_PRICE',
        display_name: 'Total Price',
      },
      {
        value: 'ID',
        display_name: 'Order ID',
      },
    ],
    desc: 'Field to sort orders by',
  },
  reverse: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
  rawQuery: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 20,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

type TFindOrderInput = {
  nameQuery?: string;
  confirmationQuery?: string;
  emailQuery?: string;
  customerIdQuery?: string;
  locationIdQuery?: string;
  skuQuery?: string;
  orderIdQuery?: string;
  sortKey?: string;
  reverse?: boolean;
  rawQuery?: string;
  limit?: number;
  cursor?: string;
};

const findOrders = async (context: TShopifyContextWithConn, data: TFindOrderInput) => {
  const limit = Math.min(data?.limit || 20, 250);
  const sortKey = data?.sortKey || 'CREATED_AT';
  const reverse = data?.reverse !== undefined ? data.reverse : true;

  let queryStr = '';

  if (data?.rawQuery) {
    queryStr = data.rawQuery;
  } else {
    const queryParts = [];

    if (data?.nameQuery) queryParts.push(`customer_name:${data.nameQuery}`);
    if (data?.confirmationQuery) queryParts.push(`confirmation_number:${data.confirmationQuery}`);
    if (data?.emailQuery) queryParts.push(`customer_email:${data.emailQuery}`);
    if (data?.customerIdQuery) queryParts.push(`customer_id:${data.customerIdQuery}`);
    if (data?.locationIdQuery) queryParts.push(`location_id:${data.locationIdQuery}`);
    if (data?.skuQuery) queryParts.push(`sku:${data.skuQuery}`);
    if (data?.orderIdQuery) queryParts.push(`id:${data.orderIdQuery}`);

    queryStr = queryParts.join(' AND ');
  }

  let cursorParam = '';
  if (data?.cursor) {
    cursorParam = `, after: "${data.cursor}"`;
  }

  const findOrdersQuery = `
    query {
      orders(
        first: ${limit}, 
        sortKey: ${sortKey}, 
        reverse: ${reverse}
        ${cursorParam}
        ${queryStr ? `, query: "${queryStr}"` : ''}) {
        edges {
          node {
            id
            name
            email
            phone
            processedAt
            createdAt
            updatedAt
            cancelledAt
            cancelReason
            displayFinancialStatus
            displayFulfillmentStatus
            confirmed
            fulfillable
            note
            tags
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            currencyCode
            customer {
              id
              firstName
              lastName
              displayName
              email
            }
            shippingAddress {
              id
              address1
              address2
              city
              company
              country
              countryCode
              firstName
              lastName
              phone
              province
              provinceCode
              zip
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const ordersResult = await executeShopifyGraphQL(context, findOrdersQuery, {});

  if (ordersResult.errors) {
    const errorMessage = ordersResult.errors.message;
    throw new ShopifyError(`Failed to find orders: ${errorMessage}`);
  }

  return {
    orders: ordersResult.data.orders,
    pageInfo: ordersResult.data.orders.pageInfo,
  };
};

export const FindShopifyOrder = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'find-order',
  app: SHOPIFY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    try {
      const { orders, pageInfo } = await findOrders(
        context as TShopifyContextWithConn,
        data as TFindOrderInput
      );

      const ordersTransformed = transformShopifyResponse(orders);

      return {
        orders: ordersTransformed,
        pageInfo,
      };
    } catch (error) {
      if (error instanceof ShopifyError) {
        throw error;
      }
      throw new ShopifyError(`Failed to find Shopify orders: ${error.message}`, error);
    }
  },
  options,
  response_type: ShopifyFindOrderResponseType,
});
