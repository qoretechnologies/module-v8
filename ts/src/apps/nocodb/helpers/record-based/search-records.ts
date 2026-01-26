import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { fromV3Response, nocodbClient, NocoDBV3Response } from '../../client';
import { NocoDBError } from '../../constants';
import { buildNocoDBFilter } from './apply-where-condition';
import { getNocoDBTableIdByPath } from './get-table-list';

export const searchNocoDBRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  const MAX_PAGE_SIZE = 100;
  const tablePath = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tablePath) {
    throw new NocoDBError('Table path is required in opts.table');
  }

  try {
    // Parse hierarchical table path (workspace/base/table) to get baseId and tableId
    const { baseId, tableId } = await getNocoDBTableIdByPath({ token, url, tablePath });

    const queryParams: Record<string, string> = {};

    // Build filter if where condition is provided
    if (where) {
      const filterString = buildNocoDBFilter(where);
      if (filterString) {
        queryParams.where = filterString;
      }
    }

    // Handle ordering - v3 API requires JSON format: [{"direction":"asc|desc","field":"FieldName"}]
    const orderBy = opts.orderBy as { field: string; direction?: string } | undefined;
    if (orderBy) {
      const direction = orderBy.direction || 'asc';
      queryParams.sort = JSON.stringify([{ field: orderBy.field, direction }]);
    }

    let offset = 0;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit);

        // v3 API endpoint: /api/v3/data/{baseId}/{tableId}/records
        const response = await nocodbClient.get<NocoDBV3Response>(
          `data/${baseId}/${tableId}/records`,
          {
            token,
            connectionOptions: { url },
            params: {
              ...queryParams,
              limit: String(pageSize),
              offset: String(offset),
            },
          }
        );

        // v3 response format: { records: [{ id, fields }] }
        const v3Records = response?.records || [];

        if (!v3Records || v3Records.length === 0) {
          hasMore = false;
          return null;
        }

        // Transform v3 response to flat record format
        const records = fromV3Response(v3Records);

        offset += records.length;

        // Check if there are more records based on pageInfo
        if (response.pageInfo?.isLastPage || records.length < pageSize) {
          hasMore = false;
        }

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof NocoDBError) {
          throw error;
        }
        throw new NocoDBError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }
    throw new NocoDBError(`Failed to initialize search for table ${tablePath}: ${error}`);
  }
};
