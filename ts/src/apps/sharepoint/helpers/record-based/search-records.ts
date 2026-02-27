/**
 * SharePoint Search Records
 *
 * Implements iterator-based search for SharePoint list items with filtering and pagination.
 * List Items are the "records" in the SharePoint record-based context.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { buildODataFilter } from './apply-where-condition';
import {
  getSharePointGraphClient,
  getSharePointSiteAndList,
  SharePointRecordError,
  TSharePointListItem,
  transformItemToRecord,
} from './constants';

/**
 * Search for SharePoint list items (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchSharePointRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: SharePointRecordError,
  });

  const tablePath = opts?.table;

  if (!tablePath) {
    throw new SharePointRecordError('Table path is required in opts.table');
  }

  try {
    const { siteId, listId } = await getSharePointSiteAndList({ token, tablePath });
    const client = getSharePointGraphClient(token);

    // Build OData $filter from WHERE condition
    const filter = where ? buildODataFilter(where) : '';

    // Handle ordering
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
    const orderByClause = orderBy?.field
      ? `fields/${orderBy.field} ${orderBy.direction || 'asc'}`
      : '';

    let nextLink: string | null = null;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        let response;

        if (nextLink) {
          // Use the nextLink for subsequent pages
          response = await client
            .api(nextLink)
            .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
            .get();
        } else {
          // Build the initial request
          let request = client.api(`/sites/${siteId}/lists/${listId}/items`);

          request = request.query({ $expand: 'fields', $top: blockSize });

          if (filter) {
            request = request.query({ $filter: filter });
          }

          if (orderByClause) {
            request = request.query({ $orderby: orderByClause });
          }

          response = await request
            .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
            .get();
        }

        const items: TSharePointListItem[] = response?.value || [];

        if (items.length === 0) {
          hasMore = false;
          return null;
        }

        // Check if there are more pages
        if (response['@odata.nextLink']) {
          nextLink = response['@odata.nextLink'];
        } else {
          hasMore = false;
        }

        // Transform items to flat record format
        const records = items.map(transformItemToRecord);

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof SharePointRecordError) {
          throw error;
        }
        throw new SharePointRecordError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof SharePointRecordError) {
      throw error;
    }
    throw new SharePointRecordError(
      `Failed to initialize search for table ${tablePath}: ${error}`
    );
  }
};
