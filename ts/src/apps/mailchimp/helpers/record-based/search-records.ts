/**
 * Mailchimp Search Records
 *
 * Implements iterator-based search for Mailchimp audience members
 * with hybrid server/client-side filtering and pagination.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { fetchMailchimpPaginatedData } from '../constants';
import {
  extractServerFilters,
  filterRecords,
  serverFiltersToParams,
  sortRecords,
} from './apply-where-condition';
import {
  getListIdByName,
  MailchimpError,
  TMailchimpMember,
  transformMemberToRecord,
} from './constants';

/**
 * Search for Mailchimp audience members (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchMailchimpRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, datacenter } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'datacenter'],
    ErrorClass: MailchimpError,
  });

  const tableName = opts?.table;
  const limit = (opts?.limit as number) || 10000;

  if (!tableName) {
    throw new MailchimpError('Table name (audience) is required in opts.table');
  }

  try {
    const listId = await getListIdByName({ token, datacenter, listName: tableName });

    // Extract server-side and client-side filters
    const { serverFilters, clientWhere } = extractServerFilters(where);
    const apiParams = serverFiltersToParams(serverFilters);

    // Fetch all matching members from Mailchimp API with server-side filters
    const members = await fetchMailchimpPaginatedData<TMailchimpMember>({
      token,
      datacenter,
      path: `lists/${listId}/members`,
      params: apiParams,
      dataPath: 'members',
    });

    // Transform to flat records
    let records = members.map(transformMemberToRecord);

    // Apply client-side WHERE filtering for conditions not handled by API
    records = filterRecords(records, clientWhere);

    // Apply sorting
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
    records = sortRecords(records, orderBy);

    // Trim to limit
    if (records.length > limit) {
      records = records.slice(0, limit);
    }

    // Create iterator state
    let offset = 0;
    let hasMore = records.length > 0;

    const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      const pageSize = Math.min(blockSize || limit, limit);
      const endIndex = Math.min(offset + pageSize, records.length);
      const batch = records.slice(offset, endIndex);

      if (batch.length === 0) {
        hasMore = false;
        return null;
      }

      offset = endIndex;
      hasMore = offset < records.length;

      return mapObjectToColumnFormat(batch);
    };

    return getRecords;
  } catch (error) {
    if (error instanceof MailchimpError) {
      throw error;
    }
    throw new MailchimpError(`Failed to search records in audience "${tableName}": ${error}`);
  }
};
