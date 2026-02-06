/**
 * Shopify Search Records
 *
 * Implements iterator-based search for Shopify products with filtering and pagination.
 * Products are the "records" in the Shopify record-based context.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { executeShopifyGraphQL } from '../constants';
import { convertWhereToShopifyQuery, sortRecords as sortRecordsClientSide } from './apply-where-condition';
import {
  MAX_PAGE_SIZE,
  PRODUCT_FIELDS_FRAGMENT,
  ShopifyRecordError,
  transformProductToRecord,
  TShopifyProduct,
  TShopifyRecordType,
} from './constants';

/**
 * Search for Shopify products (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchShopifyRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'shop'] as const,
    ErrorClass: ShopifyRecordError,
  });

  const tableName = opts?.table as TShopifyRecordType | undefined;
  const limit = Math.min((opts?.limit as number) || MAX_PAGE_SIZE, MAX_PAGE_SIZE);

  if (!tableName) {
    throw new ShopifyRecordError('Table name is required in opts.table');
  }

  if (tableName !== 'Products') {
    throw new ShopifyRecordError(`Unknown table: ${tableName}. Available tables: Products`);
  }

  // Convert WHERE condition to Shopify query string
  const queryString = convertWhereToShopifyQuery(where);

  // Get orderBy options
  const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
  const sortKey = orderBy?.field || 'TITLE';
  const reverse = orderBy?.direction === 'desc';

  // Iterator state
  let cursor: string | null = null;
  let hasMore = true;
  let fetchedProducts: TShopifyProduct[] = [];
  let recordsBuffer: Record<string, unknown>[] = [];
  let offset = 0;

  /**
   * Fetch a page of products from Shopify
   */
  const fetchPage = async (): Promise<void> => {
    const cursorParam = cursor ? `, after: "${cursor}"` : '';
    const queryParam = queryString ? `, query: "${queryString}"` : '';

    const graphqlQuery = `
      query {
        products(
          first: ${limit}
          sortKey: ${sortKey}
          reverse: ${reverse}
          ${cursorParam}
          ${queryParam}
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

    const response = await executeShopifyGraphQL(
      ctx as Parameters<typeof executeShopifyGraphQL>[0],
      graphqlQuery
    );

    const products = response.data?.products;

    if (!products) {
      hasMore = false;
      return;
    }

    fetchedProducts = products.edges.map((edge: { node: TShopifyProduct }) => edge.node);
    cursor = products.pageInfo.endCursor;
    hasMore = products.pageInfo.hasNextPage && !!cursor;

    // Transform products to flat records
    const newRecords = fetchedProducts.map((product) => transformProductToRecord(product));

    // Add to buffer
    recordsBuffer = [...recordsBuffer, ...newRecords];
  };

  // Fetch initial page
  await fetchPage();

  // Apply client-side sorting if needed (Shopify handles most sorting server-side)
  if (orderBy && !['TITLE', 'PRODUCT_TYPE', 'VENDOR', 'UPDATED_AT', 'CREATED_AT', 'BEST_SELLING', 'INVENTORY_TOTAL', 'ID'].includes(orderBy.field)) {
    recordsBuffer = sortRecordsClientSide(recordsBuffer, orderBy);
  }

  /**
   * Iterator function that returns batches of records
   */
  const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    const pageSize = Math.min(blockSize || limit, limit);

    // If we need more records and there are more pages, fetch them
    while (recordsBuffer.length - offset < pageSize && hasMore) {
      await fetchPage();
    }

    // Get batch from buffer
    const endIndex = Math.min(offset + pageSize, recordsBuffer.length);
    const batch = recordsBuffer.slice(offset, endIndex);

    if (batch.length === 0) {
      return null;
    }

    offset = endIndex;

    // Return records in column format
    return mapObjectToColumnFormat(batch);
  };

  return getRecords;
};
