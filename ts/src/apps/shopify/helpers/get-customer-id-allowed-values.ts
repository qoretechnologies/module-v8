import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface ICustomerNode {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tags?: string;
  numberOfOrders?: number;
  note?: string;
}

export const getShopifyCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<ICustomerNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          customers(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                firstName
                lastName
                email
                tags
                note
                numberOfOrders
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.customers.edges || [],
    pageInfoExtractor: (data) => data.customers.pageInfo,
    mapper: (customer) => {
      const numericId = extractShopifyNumericId(customer.id, 'Customer');

      const fullName =
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unnamed Customer';
      const email = customer.email || 'No email';

      return {
        display_name: fullName,
        value: numericId,
        short_desc:
          `Email: ${email}\n\n` +
          `Orders: ${customer.numberOfOrders || 0}\n\n` +
          `Note: ${customer.note || 'Empty'}\n\n` +
          `Tags: ${customer.tags || 'None'}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify customers',
  });
};
