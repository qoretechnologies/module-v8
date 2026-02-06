/**
 * Shopify Update Records
 *
 * Updates existing Shopify products (records) that match WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { executeShopifyGraphQL } from '../constants';
import { convertWhereToShopifyQuery, filterRecordsClientSide } from './apply-where-condition';
import {
  buildGlobalId,
  MAX_PAGE_SIZE,
  normalizeSetToSingleRecord,
  PRODUCT_FIELDS_FRAGMENT,
  ShopifyRecordError,
  transformProductToRecord,
  transformRecordToProductInput,
  TShopifyProduct,
  TShopifyRecordType,
} from './constants';

/**
 * Update products matching WHERE conditions.
 * Returns the count of updated records.
 */
export const updateShopifyRecords: TQoreUpdateRecordsFunction = async (ctx, set, where, opts) => {
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

    // Normalize set values (convert from column format if needed)
    const setValues = Array.isArray(Object.values(set)[0])
      ? normalizeSetToSingleRecord(set)
      : set;

    // Get product input from set values
    const { productInput, metafieldInputs } = transformRecordToProductInput(
      setValues as Record<string, unknown>
    );

    // Update each matching product
    let updatedCount = 0;

    for (const record of matchingRecords) {
      const productId = record.id as string;
      const globalId = buildGlobalId(productId, 'Product');

      // Build update input
      const updateInput: Record<string, unknown> = {
        id: globalId,
        ...productInput,
      };

      // Add metafields if present
      if (metafieldInputs.length > 0) {
        updateInput.metafields = metafieldInputs.map((mf) => ({
          namespace: mf.namespace,
          key: mf.key,
          value: mf.value,
          type: mf.type,
        }));
      }

      // Update the product using GraphQL mutation
      const updateMutation = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
            }
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
          updateMutation,
          { input: updateInput }
        );

        const result = response.data?.productUpdate;

        if (result?.userErrors?.length > 0) {
          console.error(`Failed to update product ${productId}:`, result.userErrors);
          continue;
        }

        if (result?.product) {
          updatedCount++;
        }
      } catch (error) {
        console.error(`Failed to update product ${productId}:`, error);
        // Continue with other products
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof ShopifyRecordError) {
      throw error;
    }

    throw new ShopifyRecordError(`Failed to update records: ${error}`);
  }
};
