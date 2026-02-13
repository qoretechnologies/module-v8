/**
 * Freshdesk Search Records
 *
 * Implements iterator-based search for Freshdesk entities with filtering and pagination.
 * Uses search endpoint when WHERE conditions are provided, list endpoint otherwise.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { buildFreshdeskWhere } from './apply-where-condition';
import {
  ENTITY_CONFIG,
  FreshdeskRecordError,
  MAX_PAGE_SIZE,
  MAX_SEARCH_PAGES,
  SEARCH_PAGE_SIZE,
  freshdeskGet,
  resolveEntity,
  transformEntityToRecord,
} from './constants';

/**
 * Search for Freshdesk records with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchFreshdeskRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, subdomain } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'subdomain'],
    ErrorClass: FreshdeskRecordError,
  });

  const tablePath = opts?.table;
  const entity = resolveEntity(tablePath);
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;
  const config = ENTITY_CONFIG[entity];

  try {
    // Build WHERE condition if provided
    const whereResult = where ? buildFreshdeskWhere(where) : null;
    const serverQuery = whereResult?.query || null;
    const clientFilter = whereResult?.clientFilter || null;

    // Handle ordering
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;

    let currentPage = 1;
    let hasMore = true;
    let totalFetched = 0;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore || totalFetched >= limit) {
        return null;
      }

      try {
        let items: Record<string, unknown>[];

        if (serverQuery) {
          // Use search endpoint
          if (currentPage > MAX_SEARCH_PAGES) {
            hasMore = false;
            return null;
          }

          const response = await freshdeskGet<{ total: number; results: Record<string, unknown>[] }>(
            config.searchPath,
            token,
            subdomain,
            {
              query: `"${serverQuery}"`,
              page: String(currentPage),
            }
          );

          items = response?.results || [];

          // Search endpoint returns max SEARCH_PAGE_SIZE per page
          if (items.length < SEARCH_PAGE_SIZE) {
            hasMore = false;
          }
        } else {
          // Use list endpoint
          const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit - totalFetched);
          const params: Record<string, string> = {
            per_page: String(pageSize),
            page: String(currentPage),
          };

          // Apply ordering on list endpoints
          if (orderBy?.field) {
            params.order_by = orderBy.field;
            params.order_type = orderBy.direction === 'desc' ? 'desc' : 'asc';
          }

          const response = await freshdeskGet<Record<string, unknown>[]>(
            config.listPath,
            token,
            subdomain,
            params
          );

          items = response || [];

          if (items.length < Math.min(blockSize, MAX_PAGE_SIZE)) {
            hasMore = false;
          }
        }

        if (items.length === 0) {
          hasMore = false;
          return null;
        }

        currentPage++;

        // Transform to records
        let records = items.map((item) => transformEntityToRecord(item, entity));

        // Apply client-side filter if needed
        if (clientFilter) {
          records = records.filter(clientFilter);
        }

        totalFetched += records.length;

        if (records.length === 0) {
          // All records were filtered out by client filter, try next page
          if (hasMore && totalFetched < limit) {
            return get_records(_ctx, blockSize);
          }
          return null;
        }

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof FreshdeskRecordError) {
          throw error;
        }
        throw new FreshdeskRecordError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof FreshdeskRecordError) {
      throw error;
    }
    throw new FreshdeskRecordError(`Failed to initialize search for table ${tablePath}: ${error}`);
  }
};
