import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS, TShopifyContextWithConn } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

export const getShopifyFulfillmentOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<any, string>(context as TShopifyContextWithConn, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          fulfillmentOrders(first: 50, sortKey: UPDATED_AT, reverse: true${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                status
                requestStatus
                createdAt
                deliveryMethod {
                  presentedName
                }
                order {
                  id
                  name
                  customer {
                    firstName
                    lastName
                    email
                  }
                }
                destination {
                  address1
                  address2
                  city
                  province
                  countryCode
                  zip
                }
              }
            }
          }
        }
      `;
    },
    dataExtractor: (data) => data.fulfillmentOrders.edges || [],
    pageInfoExtractor: (data) => data.fulfillmentOrders.pageInfo,
    mapper: (node) => {
      const order = node.order || {};
      const customer = order.customer || {};
      const destination = node.destination || {};
      const deliveryMethod = node.deliveryMethod || {};

      const address = [
        destination.address1,
        destination.address2,
        destination.city,
        destination.province,
        destination.zip,
        destination.countryCode,
      ]
        .filter(Boolean)
        .join(', ');

      const customerInfo = [customer.firstName, customer.lastName, customer.email]
        .filter(Boolean)
        .join(' ');

      return {
        display_name: `${order.name || 'Unknown Order'} - ${node.status || 'Unknown Status'}`,
        value: extractShopifyNumericId(node.id),
        desc:
          `Created: ${new Date(node.createdAt).toLocaleString()}\n` +
          `Status: ${node.status}, Request Status: ${node.requestStatus}\n` +
          `Order: ${order.name || 'Unknown'}\n` +
          `Customer: ${customerInfo || 'Unknown'}\n` +
          `Shipping: ${deliveryMethod.presentedName || 'Not specified'}\n` +
          `Destination: ${address || 'No address'}`,
      };
    },
    errorMessage: 'Failed to fetch Shopify fulfillment orders',
  });
};
