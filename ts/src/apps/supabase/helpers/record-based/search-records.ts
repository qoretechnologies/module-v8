import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { SupabaseError } from '../../constants';
import { createSupabaseClient } from '../constants';
import { applySupabaseWhereCondition } from './apply-where-condition';

export const searchSupabaseRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, projectId } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'projectId'],
    ErrorClass: SupabaseError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new SupabaseError('Table name is required in opts.table');
  }

  const client = createSupabaseClient({ token, projectId });
  let query = client.from(tableName).select('*', { count: 'exact' });

  if (where) {
    query = applySupabaseWhereCondition(query, where);
  }

  const orderBy = opts.orderBy as { column: string; ascending?: boolean };

  if (orderBy) {
    query = query.order(orderBy.column, {
      ascending: orderBy.ascending ?? true,
    });
  }

  const maxLimit = opts.limit as number | undefined;
  let offset = 0;
  let totalCount: number | null = null;
  let recordsReturned = 0;

  const get_records: TQoreSearchRecordsIterator = (_ctx, blockSize) => {
    return (async () => {
      if (totalCount !== null && offset >= totalCount) {
        return null;
      }

      if (maxLimit !== undefined && recordsReturned >= maxLimit) {
        return null;
      }

      try {
        const effectiveBlockSize = maxLimit !== undefined 
          ? Math.min(blockSize, maxLimit - recordsReturned)
          : blockSize;

        let pagedQuery = query.range(offset, offset + effectiveBlockSize - 1);
        const { data, error, count } = await pagedQuery;

        if (error) {
          throw new SupabaseError(`Supabase error: ${error.message}`);
        }

        if (totalCount === null) {
          totalCount = count ?? 0;
        }

        if (!data || data.length === 0) {
          return null;
        }

        offset += data.length;
        recordsReturned += data.length;

        return mapObjectToColumnFormat(data);
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw error;
        }
        throw new SupabaseError(`Failed to search records: ${error.message || error}`);
      }
    })();
  };

  return get_records;
};
