import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface IProductVariantNode {
  id: string;
  title: string;
  sku?: string;
  price: string;
  availableForSale: boolean;
  inventoryQuantity?: number;
  product: {
    title: string;
    handle: string;
  };
}

export const getShopifyProductVariantIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<IProductVariantNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          productVariants(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                sku
                price 
                availableForSale
                inventoryQuantity
                product {
                  title
                  handle
                }
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.productVariants.edges || [],

    pageInfoExtractor: (data) => data.productVariants.pageInfo,

    mapper: (variant) => {
      const numericId = extractShopifyNumericId(variant.id, 'ProductVariant');
      const productTitle = variant.product.title || 'Unknown Product';
      const price = parseFloat(variant.price).toFixed(2);
      const inventoryStatus = variant.availableForSale
        ? `In stock (${variant.inventoryQuantity !== undefined ? variant.inventoryQuantity : 'Unknown'})`
        : 'Out of stock';

      const displayName =
        variant.title === 'Default Title' ? productTitle : `${productTitle} - ${variant.title}`;

      return {
        display_name: `${displayName} (${price})`,
        value: numericId,
        desc:
          `Product: ${productTitle}\n\n` +
          `Variant: ${variant.title}\n\n` +
          `SKU: ${variant.sku || 'N/A'}\n\n` +
          `Price: ${price}\n\n` +
          `Inventory: ${inventoryStatus}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify product variants',
  });
};
