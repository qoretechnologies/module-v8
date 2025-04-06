import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface IOrderNode {
  id: string;
  name: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt: string;
  displayFinancialStatus?: string;
  displayFulfillmentStatus?: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
}

export const getShopifyOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<IOrderNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          orders(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                name
                customer {
                  firstName
                  lastName
                  email
                }
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.orders.edges || [],
    pageInfoExtractor: (data) => data.orders.pageInfo,
    mapper: (order) => {
      const numericId = extractShopifyNumericId(order.id, 'Order');

      const customerName = order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : 'Anonymous';

      const customerEmail = order.customer?.email || 'No email';

      const date = new Date(order.createdAt).toLocaleString();
      const amount =
        `${parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(2)} ` +
        `${order.totalPriceSet.shopMoney.currencyCode}`;

      return {
        display_name: `${order.name} (${amount})`,
        value: numericId,
        short_desc:
          `Date: ${date}\n\n` +
          `Customer: ${customerName}\n\n` +
          `Email: ${customerEmail}\n\n` +
          `Payment: ${order.displayFinancialStatus || 'Unknown'}\n\n` +
          `Fulfillment: ${order.displayFulfillmentStatus || 'Unknown'}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify orders',
  });
};
