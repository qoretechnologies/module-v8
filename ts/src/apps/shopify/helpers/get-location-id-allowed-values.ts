import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface ILocationNode {
  id: string;
  name: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  isActive: boolean;
  fulfillsOnlineOrders?: boolean;
}

export const getShopifyLocationIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<ILocationNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          locations(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                name
                address {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                isActive
                fulfillsOnlineOrders
              }
            }
          }
        }
      `;
    },
    dataExtractor: (data) => data.locations.edges || [],
    pageInfoExtractor: (data) => data.locations.pageInfo,
    mapper: (location) => {
      const numericId = extractShopifyNumericId(location.id, 'Location');

      const address = location.address
        ? [
            location.address.address1,
            location.address.address2,
            location.address.city,
            location.address.province,
            location.address.zip,
            location.address.country,
          ]
            .filter(Boolean)
            .join(', ')
        : 'No address';

      const status = location.isActive ? 'Active' : 'Inactive';
      const fulfillment = location.fulfillsOnlineOrders
        ? 'Fulfills online orders'
        : 'Does not fulfill online orders';

      return {
        display_name: `${location.name} ${location.isActive ? '(Active)' : '(Inactive)'}`,
        value: numericId,
        desc: `Address: ${address}\n\n` + `Status: ${status}\n\n` + `Fulfillment: ${fulfillment}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify locations',
  });
};
