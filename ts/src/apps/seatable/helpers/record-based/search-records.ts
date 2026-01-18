import { TQoreSearchRecordsFunction, TQoreSearchRecordsIterator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { seatableClient, SeaTableSqlResponse } from '../../client';
import { SeaTableError } from '../../constants';
import { buildSeaTableFilter } from './apply-where-condition';

export const searchSeaTableRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  const MAX_PAGE_SIZE = 1000; // SeaTable SQL max
  const tableName = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tableName) {
    throw new SeaTableError('Table name is required in opts.table');
  }

  try {
    let offset = 0;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize, MAX_PAGE_SIZE, limit);

        // Build SQL query
        let sql = `SELECT * FROM \`${tableName}\``;

        // Add WHERE clause if conditions provided
        if (where) {
          const filterString = buildSeaTableFilter(where);
          if (filterString) {
            sql += ` WHERE ${filterString}`;
          }
        }

        // Handle ordering
        const orderBy = opts.orderBy as { field: string; direction?: string } | undefined;
        if (orderBy) {
          const direction = orderBy.direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          sql += ` ORDER BY \`${orderBy.field}\` ${direction}`;
        }

        // Add pagination
        sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

        // Execute SQL query
        const response = await seatableClient.basePost<SeaTableSqlResponse>(
          'sql/',
          { sql, convert_keys: true },
          { connectionOptions: { url, token } }
        );

        const records = response?.results || [];

        if (!records || records.length === 0) {
          hasMore = false;
          return null;
        }

        offset += records.length;

        // Check if there are more records
        if (records.length < pageSize) {
          hasMore = false;
        }

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof SeaTableError) {
          throw error;
        }
        throw new SeaTableError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }
    throw new SeaTableError(`Failed to initialize search for table ${tableName}: ${error}`);
  }
};
