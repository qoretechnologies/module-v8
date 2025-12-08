import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { buildAttioFilter } from './apply-where-condition';
import { attioApiClient } from '../client';
import { formatAttioResponse, TAttioRecordAttributes } from '../format-response';

export const searchAttioRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new AttioError('Table name is required in opts.table');
  }

  const filter = where ? buildAttioFilter(where) : undefined;
  const orderBy = opts.orderBy as { column: string; ascending?: boolean } | undefined;
  const maxLimit = opts.limit as number | undefined;

  let offset = 0;
  let recordsReturned = 0;
  const pageSize = 100;

  const get_records: TQoreSearchRecordsIterator = (_ctx, blockSize) => {
    return (async () => {
      if (maxLimit !== undefined && recordsReturned >= maxLimit) {
        return null;
      }

      try {
        const effectiveBlockSize =
          maxLimit !== undefined ? Math.min(blockSize, maxLimit - recordsReturned) : blockSize;

        const requestBody: Record<string, any> = {
          limit: Math.min(effectiveBlockSize, pageSize),
          offset,
        };

        if (filter && Object.keys(filter).length > 0) {
          requestBody.filter = filter;
        }

        if (orderBy) {
          requestBody.sorts = [
            {
              attribute: orderBy.column,
              direction: orderBy.ascending !== false ? 'asc' : 'desc',
            },
          ];
        }

        const records = await attioApiClient<TAttioRecordAttributes[]>({
          path: `/v2/objects/${tableName}/records/query`,
          method: 'POST',
          object: 'data',
          token,
          body: requestBody,
        });

        if (!records || records.length === 0) {
          return null;
        }

        const formattedRecords = await formatAttioResponse(
          {
            data: records,
          },
          'objects',
          tableName,
          token
        );

        offset += records.length;
        recordsReturned += records.length;

        return mapObjectToColumnFormat(formattedRecords as Record<string, any>[]);
      } catch (error) {
        if (error instanceof AttioError) {
          throw error;
        }
        throw new AttioError(`Failed to search records: ${error?.message || error}`);
      }
    })();
  };

  return get_records;
};
