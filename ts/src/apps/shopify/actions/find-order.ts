import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_APP_NAME, TShopifyContextWithConn } from '../constants';
import {
  executeShopifyGraphQL,
  ShopifyError,
  transformShopifyResponse,
} from '../helpers/constants';
import { ShopifyFindOrderResponseType } from './response-types/find-order-response';
import { getShopifyCustomerIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getShopifyOrderIdAllowedValues } from '../helpers/get-order-id-allowed-values';

const options = {
  name: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  customer_id: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyCustomerIdAllowedValues,
    allowed_values_creatable: true,
  },
  confirmation_number: {
    type: 'string',
    required: false,
  },
  id: {
    type: 'string',
    required: false,
    get_allowed_values: getShopifyOrderIdAllowedValues,
    allowed_values_creatable: true,
  },
  financial_status: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'paid', display_name: 'Paid' },
      { value: 'pending', display_name: 'Pending' },
      { value: 'authorized', display_name: 'Authorized' },
      { value: 'partially_paid', display_name: 'Partially Paid' },
      { value: 'partially_refunded', display_name: 'Partially Refunded' },
      { value: 'refunded', display_name: 'Refunded' },
      { value: 'voided', display_name: 'Voided' },
      { value: 'expired', display_name: 'Expired' },
    ],
  },
  fulfillment_status: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'unshipped', display_name: 'Unshipped' },
      { value: 'shipped', display_name: 'Shipped' },
      { value: 'fulfilled', display_name: 'Fulfilled' },
      { value: 'partial', display_name: 'Partial' },
      { value: 'scheduled', display_name: 'Scheduled' },
      { value: 'on_hold', display_name: 'On Hold' },
      { value: 'unfulfilled', display_name: 'Unfulfilled' },
      { value: 'request_declined', display_name: 'Request Declined' },
    ],
  },
  status: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'open', display_name: 'Open' },
      { value: 'closed', display_name: 'Closed' },
      { value: 'cancelled', display_name: 'Cancelled' },
      { value: 'not_closed', display_name: 'Not Closed' },
    ],
  },

  source_name: {
    type: 'string',
    required: false,
  },
  sales_channel: {
    type: 'string',
    required: false,
  },

  sku: {
    type: 'string',
    required: false,
  },

  created_at: {
    type: 'string',
    required: false,
  },
  updated_at: {
    type: 'string',
    required: false,
  },
  processed_at: {
    type: 'string',
    required: false,
  },

  tag: {
    type: 'string',
    required: false,
  },

  test: {
    type: 'boolean',
    required: false,
  },
  location_id: {
    type: 'string',
    required: false,
  },
  po_number: {
    type: 'string',
    required: false,
  },

  rawQuery: {
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
  },
  reverse: {
    type: 'boolean',
    required: false,
    default_value: true,
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
  name?: string;
  email?: string;
  customer_id?: string;
  confirmation_number?: string;
  id?: string;
  financial_status?: string;
  fulfillment_status?: string;
  status?: string;
  source_name?: string;
  sales_channel?: string;
  sku?: string;
  created_at?: string;
  updated_at?: string;
  processed_at?: string;
  tag?: string;
  test?: boolean;
  location_id?: string;
  po_number?: string;
  rawQuery?: string;
  sortKey?: string;
  reverse?: boolean;
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

    if (data?.name) queryParts.push(`name:${data.name}`);
    if (data?.email) queryParts.push(`email:${data.email}`);
    if (data?.customer_id) queryParts.push(`customer_id:${data.customer_id}`);
    if (data?.confirmation_number)
      queryParts.push(`confirmation_number:${data.confirmation_number}`);
    if (data?.id) queryParts.push(`id:${data.id}`);
    if (data?.financial_status) queryParts.push(`financial_status:${data.financial_status}`);
    if (data?.fulfillment_status) queryParts.push(`fulfillment_status:${data.fulfillment_status}`);
    if (data?.status) queryParts.push(`status:${data.status}`);
    if (data?.source_name) queryParts.push(`source_name:${data.source_name}`);
    if (data?.sales_channel) queryParts.push(`sales_channel:${data.sales_channel}`);
    if (data?.sku) queryParts.push(`sku:${data.sku}`);
    if (data?.created_at) queryParts.push(`created_at:${data.created_at}`);
    if (data?.updated_at) queryParts.push(`updated_at:${data.updated_at}`);
    if (data?.processed_at) queryParts.push(`processed_at:${data.processed_at}`);
    if (data?.tag) queryParts.push(`tag:${data.tag}`);
    if (data?.test !== undefined) queryParts.push(`test:${data.test}`);
    if (data?.location_id) queryParts.push(`location_id:${data.location_id}`);
    if (data?.po_number) queryParts.push(`po_number:${data.po_number}`);

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
