/**
 * Shopify Delete Records
 *
 * Deletes Shopify products (records) that match WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { executeShopifyGraphQL } from '../constants';
import { convertWhereToShopifyQuery, filterRecordsClientSide } from './apply-where-condition';
import {
  buildGlobalId,
  MAX_PAGE_SIZE,
  PRODUCT_FIELDS_FRAGMENT,
  ShopifyRecordError,
  transformProductToRecord,
  TShopifyProduct,
  TShopifyRecordType,
} from './constants';

/**
 * Delete products matching WHERE conditions.
 * Returns the count of deleted records.
 *
 * WARNING: This operation is irreversible. A WHERE condition is required
 * to prevent accidental deletion of all products.
 */
export const deleteShopifyRecords: TQoreDeleteRecordsFunction = async (ctx, where, opts) => {
  getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'shop'] as const,
    ErrorClass: ShopifyRecordError,
  });

  const tableName = opts?.table as TShopifyRecordType | undefined;

  if (!tableName) {
    throw new ShopifyRecordError('Table name is required in opts.table');
  }

  if (tableName !== 'Products') {
    throw new ShopifyRecordError(`Unknown table: ${tableName}. Available tables: Products`);
  }

  // Require WHERE condition to prevent accidental mass deletion
  if (!where) {
    throw new ShopifyRecordError(
      'WHERE condition is required for delete operation to prevent accidental deletion of all products'
    );
  }

  try {
    // Convert WHERE condition to Shopify query string
    const queryString = convertWhereToShopifyQuery(where);

    // Fetch matching products
    const fetchQuery = `
      query {
        products(
          first: ${MAX_PAGE_SIZE}
          ${queryString ? `, query: "${queryString}"` : ''}
        ) {
          edges {
            node {
              ${PRODUCT_FIELDS_FRAGMENT}
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    let allProducts: TShopifyProduct[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    // Paginate through all matching products
    while (hasMore) {
      const cursorParam = cursor ? `, after: "${cursor}"` : '';
      const paginatedQuery = fetchQuery.replace(
        `first: ${MAX_PAGE_SIZE}`,
        `first: ${MAX_PAGE_SIZE}${cursorParam}`
      );

      const response = await executeShopifyGraphQL(
        ctx as Parameters<typeof executeShopifyGraphQL>[0],
        paginatedQuery
      );

      const products = response.data?.products;

      if (!products) {
        break;
      }

      const pageProducts = products.edges.map((edge: { node: TShopifyProduct }) => edge.node);
      allProducts = [...allProducts, ...pageProducts];

      cursor = products.pageInfo.endCursor;
      hasMore = products.pageInfo.hasNextPage && !!cursor;
    }

    // Transform to records and apply additional client-side filtering if needed
    let matchingRecords = allProducts.map((product) => transformProductToRecord(product));

    // Apply client-side WHERE filtering for more precise matching
    matchingRecords = filterRecordsClientSide(matchingRecords, where);

    if (matchingRecords.length === 0) {
      return 0;
    }

    // Delete each matching product
    let deletedCount = 0;

    for (const record of matchingRecords) {
      const productId = record.id as string;
      const globalId = buildGlobalId(productId, 'Product');

      // Delete the product using GraphQL mutation
      const deleteMutation = `
        mutation productDelete($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }
      `;

      try {
        const response = await executeShopifyGraphQL(
          ctx as Parameters<typeof executeShopifyGraphQL>[0],
          deleteMutation,
          { input: { id: globalId } }
        );

        const result = response.data?.productDelete;

        if (result?.userErrors?.length > 0) {
          console.error(`Failed to delete product ${productId}:`, result.userErrors);
          continue;
        }

        if (result?.deletedProductId) {
          deletedCount++;
        }
      } catch (error) {
        console.error(`Failed to delete product ${productId}:`, error);
        // Continue with other products
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof ShopifyRecordError) {
      throw error;
    }

    throw new ShopifyRecordError(`Failed to delete records: ${error}`);
  }
};
