import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { extractShopifyNumericId, getShopifyAllowedValues } from './constants';

interface IProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  status: string;
  totalInventory: number;
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
    };
    maxVariantPrice: {
      amount: string;
    };
  };
  tags: string[];
}

export const getShopifyProductIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  return await getShopifyAllowedValues<IProductNode, string>(context, {
    queryBuilder: (after: string | null) => {
      return `
        query {
          products(first: 100${after ? `, after: "${after}"` : ''}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                description
                productType
                vendor
                status
                totalInventory
                priceRangeV2 {
                  minVariantPrice {
                    amount
                  }
                  maxVariantPrice {
                    amount
                  }
                }
                tags
              }
            }
          }
        }
      `;
    },

    dataExtractor: (data) => data.products.edges || [],

    pageInfoExtractor: (data) => data.products.pageInfo,

    mapper: (product) => {
      const numericId = extractShopifyNumericId(product.id, 'Product');
      const minPrice = parseFloat(product.priceRangeV2.minVariantPrice.amount).toFixed(2);
      const maxPrice = parseFloat(product.priceRangeV2.maxVariantPrice.amount).toFixed(2);
      const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

      const inventoryStatus =
        product.totalInventory > 0 ? `In stock (${product.totalInventory})` : 'Out of stock';

      return {
        display_name: `${product.title} (${priceDisplay})`,
        value: numericId,
        desc:
          `Title: ${product.title}\n\n` +
          `Type: ${product.productType || 'N/A'}\n\n` +
          `Vendor: ${product.vendor || 'N/A'}\n\n` +
          `Status: ${product.status || 'N/A'}\n\n` +
          `Price: ${priceDisplay}\n\n` +
          `Inventory: ${inventoryStatus}\n\n` +
          `Tags: ${product.tags?.join(', ') || 'None'}`,
      };
    },

    errorMessage: 'Failed to fetch Shopify products',
  });
};
