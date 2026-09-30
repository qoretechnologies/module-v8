import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { extractPipedriveError, PipedriveError } from '../../constants';
import { pipedriveRecordPages, pipedriveApiClient } from '../client';
import {
  getPipedriveFieldNameToIdMap,
  PipedriveTableNameToFieldEndpointMap,
} from '../get-object-fields';
import { buildPipedriveFilter, mapPipedriveFieldNamesToIds } from './apply-where-condition';
import {
  PipedriveTableToFilterTypeMap,
  PipedriveTableToObjectMap,
  TPipedriveTable,
  usePipedriveV1Endpoint,
  pipedriveTablePath,
} from './constants';
import { Debugger } from '../../../../utils/Debugger';

type TPipedriveFilterResponse = {
  id: number;
  name: string;
};

export const searchPipedriveRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  const tableName = opts?.table as TPipedriveTable;

  if (!tableName) {
    throw new PipedriveError('Table name is required in opts.table');
  }

  const recordPath = pipedriveTablePath(tableName);
  let filterId: number | undefined;

  if (where) {
    const fieldsPath = PipedriveTableNameToFieldEndpointMap[tableName];

    if (!fieldsPath) {
      throw new PipedriveError(
        `Searching with conditions is not supported for table: ${tableName}`
      );
    }

    try {
      const filterType = PipedriveTableToFilterTypeMap[tableName];
      const objectType = PipedriveTableToObjectMap[tableName];
      const fieldNameToIdMap = await getPipedriveFieldNameToIdMap(token, fieldsPath);

      if (!fieldNameToIdMap) {
        throw new PipedriveError(`Failed to create filter for table: ${tableName}`);
      }

      const formattedWhereConditions = mapPipedriveFieldNamesToIds(where, fieldNameToIdMap);
      const filterConditions = buildPipedriveFilter(formattedWhereConditions, objectType);

      const filterResponse = await pipedriveApiClient<TPipedriveFilterResponse>({
        token,
        method: 'POST',
        path: 'v1/filters',
        body: {
          name: `Qorus Temp Filter ${Date.now()}`,
          conditions: filterConditions,
          type: filterType,
        },
        object: 'data',
      });

      filterId = filterResponse.id;
    } catch (error) {
      throw new PipedriveError(`Failed to create filter: ${extractPipedriveError(error)}`);
    }
  }

  const orderBy = opts?.orderBy as { column: string; ascending?: boolean } | undefined;
  const maxLimit = opts?.limit as number | undefined;

  let pages: AsyncGenerator<Record<string, any>[]> | undefined;
  let finished = false;
  let retrievedCount = 0;
  const cleanup = async () => {
    if (filterId !== undefined) {
      const id = filterId;
      filterId = undefined;
      try {
        await pipedriveApiClient({ token, method: 'DELETE', path: `v1/filters/${id}` });
      } catch (error) {
        Debugger.log(`Failed to delete temporary filter ${id}: ${extractPipedriveError(error)}`);
      }
    }
  };
  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    if (finished) {
      return null;
    }
    try {
      if (!pages) {
        const queryParams: Record<string, string> = {};
        if (filterId !== undefined) {
          queryParams.filter_id = String(filterId);
        }
        if (orderBy) {
          if (usePipedriveV1Endpoint(tableName)) {
            queryParams.sort = `${orderBy.column} ${orderBy.ascending !== false ? 'ASC' : 'DESC'}`;
          } else {
            queryParams.sort_by = orderBy.column;
            queryParams.sort_direction = orderBy.ascending !== false ? 'asc' : 'desc';
          }
        }
        pages = pipedriveRecordPages<Record<string, any>>({ token, path: recordPath,
          params: queryParams, limit: Math.min(blockSize, 500),
          maxResults: maxLimit ?? Number.MAX_SAFE_INTEGER });
      }
      const next = await pages.next();
      if (next.done) {
        finished = true;
        await cleanup();
        return null;
      }
      const records = next.value;
      retrievedCount += records.length;
      if (maxLimit !== undefined && retrievedCount >= maxLimit) {
        finished = true;
        await cleanup();
      }
      const formattedRecords = records.map((record) => {
        if (record.custom_fields && typeof record.custom_fields === 'object') {
          return { ...omit(record, 'custom_fields'), ...record.custom_fields };
        }
        return record;
      });

      return mapObjectToColumnFormat(formattedRecords);
    } catch (error) {
      finished = true;
      await cleanup();

      if (error instanceof PipedriveError) {
        throw error;
      }
      throw new PipedriveError(
        `Failed to search records in table ${tableName}: ${extractPipedriveError(error)}`
      );
    }
  };

  return get_records;
};
