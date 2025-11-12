import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { BaserowError } from '../../constants';
import { fetchBaserowPaginatedRecords } from '../constants';
import { buildBaserowFilter } from './apply-where-condition';
import { getBaserowTableIdByName } from './constants';

export const searchBaserowRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  const MAX_PAGE_SIZE = 200;
  const tableName = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tableName) {
    throw new BaserowError('Table name is required in opts.table');
  }

  try {
    const tableId = await getBaserowTableIdByName({ token, url, tableName });

    const filterParams: Record<string, string> = {
      user_field_names: 'true',
    };

    if (where) {
      const filterGroup = buildBaserowFilter(where);
      filterParams.filters = JSON.stringify(filterGroup);
    }

    const orderBy = opts.orderBy as { column: string; ascending?: boolean } | undefined;

    if (orderBy) {
      const direction = orderBy.ascending !== false ? '' : '-';
      filterParams.order_by = `${direction}${orderBy.column}`;
    }

    let page = 1;
    let hasMore = true;

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        const records = await fetchBaserowPaginatedRecords<any, Record<string, any>>({
          token,
          url,
          path: `database/rows/table/${tableId}`,
          params: {
            ...filterParams,
            page: String(page),
            size: String(Math.min(blockSize, MAX_PAGE_SIZE, limit)),
          },
          maxResults: blockSize,
          object: 'results',
        });

        if (!records || records.length === 0) {
          hasMore = false;
          return null;
        }

        page += 1;

        if (records.length < blockSize) {
          hasMore = false;
        }

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof BaserowError) {
          throw error;
        }
        throw new BaserowError(`Failed to search records: ${error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }
    throw new BaserowError(`Failed to initialize search for table ${tableName}: ${error}`);
  }
};
