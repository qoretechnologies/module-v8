import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { extractPipedriveError, PipedriveError } from '../../constants';
import { fetchPipedrivePaginatedRecords, pipedriveApiClient } from '../client';
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

  const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
    try {
      const queryParams: Record<string, any> = {};

      if (filterId) {
        queryParams.filter_id = filterId;
      }

      if (orderBy) {
        const sortField = `${orderBy.column} ${orderBy.ascending !== false ? 'ASC' : 'DESC'}`;
        queryParams.sort = sortField;
      }

      const useV1Endpoint = usePipedriveV1Endpoint(tableName);

      const records = await fetchPipedrivePaginatedRecords<any, Record<string, any>>({
        token,
        method: 'GET',
        path: useV1Endpoint ? `v1/${tableName}` : tableName,
        params: queryParams,
        maxResults: maxLimit,
        limit: blockSize,
        object: 'data',
      });

      if (maxLimit !== undefined && records?.length >= maxLimit) {
        if (filterId) {
          try {
            await pipedriveApiClient({
              token,
              method: 'DELETE',
              path: `v1/filters/${filterId}`,
            });
          } catch (error) {
            Debugger.log(
              `Failed to delete temporary filter with ID ${filterId}: ${extractPipedriveError(error)}`
            );
          }
        }
        return null;
      }

      const formattedRecords = records.map((record) => {
        if (record.custom_fields && typeof record.custom_fields === 'object') {
          return { ...omit(record, 'custom_fields'), ...record.custom_fields };
        }
        return record;
      });

      return mapObjectToColumnFormat(formattedRecords);
    } catch (error) {
      if (filterId) {
        try {
          await pipedriveApiClient({
            token,
            method: 'DELETE',
            path: `v1/filters/${filterId}`,
          });
        } catch (cleanupError) {
          Debugger.log(
            `Failed to delete temporary filter with ID ${filterId}: ${extractPipedriveError(
              cleanupError
            )}`
          );
        }
      }

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
