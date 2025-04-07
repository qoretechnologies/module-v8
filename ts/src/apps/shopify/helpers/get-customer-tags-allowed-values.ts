import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { getShopifyAllowedValues } from './constants';

export const getShopifyCustomerTagsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<string, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          shop {
            customerTags(first: 250${after ? `, after: "${after}"` : ''}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node
              }
            }
          }
        }
      `;
    },
    dataExtractor: (data) => data.shop.customerTags.edges || [],
    pageInfoExtractor: (data) => data.shop.customerTags.pageInfo,
    mapper: (tag) => ({
      display_name: tag,
      value: tag,
    }),

    errorMessage: 'Failed to fetch Shopify customer tags',
  });
};
