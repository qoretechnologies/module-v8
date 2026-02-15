/**
 * NetSuite Search Records
 *
 * Implements paginated search using SuiteQL. Returns an iterator function
 * that yields record batches in column format.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsFunction, TQoreSearchRecordsIterator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { fetchSuiteQlData } from '../constants';
import { buildSuiteQlWhereClause } from './apply-where-condition';
import { escapeSqlIdentifier, MAX_PAGE_SIZE, NetsuiteRecordError } from './constants';

/**
 * Search NetSuite records using SuiteQL with pagination.
 * Returns an iterator that yields batches of records in column format.
 */
export const searchNetsuiteRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, account_id } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'account_id'],
    ErrorClass: NetsuiteRecordError,
  });

  const recordType = opts?.table;

  if (!recordType) {
    throw new NetsuiteRecordError('Table name is required in opts.table');
  }

  const safeRecordType = escapeSqlIdentifier(recordType);
  const whereClause = buildSuiteQlWhereClause(where);

  // Build ORDER BY clause
  let orderByClause = '';
  const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
  if (orderBy?.field) {
    const safeField = escapeSqlIdentifier(orderBy.field);
    const direction = orderBy.direction === 'desc' ? 'DESC' : 'ASC';
    orderByClause = ` ORDER BY ${safeField} ${direction}`;
  }

  const limit = (opts?.limit as number) || 100000;
  let offset = 0;
  let hasMore = true;
  let totalFetched = 0;

  const baseQuery = `SELECT * FROM ${safeRecordType}${
    whereClause ? ` WHERE ${whereClause}` : ''
  }${orderByClause}`;

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (!hasMore || totalFetched >= limit) {
      return null;
    }

    const currentPageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit - totalFetched);

    try {
      const result = await fetchSuiteQlData({
        accountId: account_id,
        token,
        q: baseQuery,
        limit: currentPageSize,
        offset,
      });

      if (!result.items || result.items.length === 0) {
        hasMore = false;
        return null;
      }

      totalFetched += result.items.length;
      offset += result.items.length;
      hasMore = result.hasMore && totalFetched < limit;

      const records = result.items as Record<string, unknown>[];
      return mapObjectToColumnFormat(records);
    } catch (error) {
      if (error instanceof NetsuiteRecordError) {
        throw error;
      }
      throw new NetsuiteRecordError(`Failed to search records: ${error}`);
    }
  };

  return get_records;
};
