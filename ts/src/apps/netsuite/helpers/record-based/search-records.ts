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

  const totalLimit = (opts?.limit as number) || 100000;
  let totalFetched = 0;
  let exhausted = false;

  // Internal buffer: SuiteQL requires offset % limit == 0, so we fetch in
  // fixed-size pages and serve from the buffer to honour variable blockSize.
  let buffer: Record<string, unknown>[] = [];
  let suiteQlOffset = 0;
  let suiteQlPageSize = 0; // set on first call

  const baseQuery = `SELECT * FROM ${safeRecordType}${
    whereClause ? ` WHERE ${whereClause}` : ''
  }${orderByClause}`;

  const fillBuffer = async (minPageSize: number): Promise<void> => {
    if (exhausted) {
      return;
    }

    // Set page size on first fetch and keep it constant so offset stays aligned
    if (suiteQlPageSize === 0) {
      suiteQlPageSize = Math.min(minPageSize, MAX_PAGE_SIZE);
    }

    const result = await fetchSuiteQlData({
      accountId: account_id,
      token,
      q: baseQuery,
      limit: suiteQlPageSize,
      offset: suiteQlOffset,
    });

    if (!result.items || result.items.length === 0) {
      exhausted = true;
      return;
    }

    buffer.push(...(result.items as Record<string, unknown>[]));
    suiteQlOffset += result.items.length;

    if (!result.hasMore) {
      exhausted = true;
    }
  };

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (totalFetched >= totalLimit) {
      return null;
    }

    const remaining = totalLimit - totalFetched;
    const needed = Math.min(blockSize, remaining);

    try {
      // Fill buffer until we have enough items or data is exhausted
      while (buffer.length < needed && !exhausted) {
        await fillBuffer(needed);
      }

      if (buffer.length === 0) {
        return null;
      }

      // Take the requested number of items from the buffer
      const batch = buffer.splice(0, needed);
      totalFetched += batch.length;

      return mapObjectToColumnFormat(batch);
    } catch (error) {
      if (error instanceof NetsuiteRecordError) {
        throw error;
      }
      throw new NetsuiteRecordError(`Failed to search records: ${error}`);
    }
  };

  return get_records;
};
