import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
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

export const deletePipedriveRecords: TQoreDeleteRecordsFunction = async (context, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  const tableName = opts?.table as TPipedriveTable;

  if (!tableName) {
    throw new PipedriveError('Table name is required');
  }

  let filterId: number | undefined;

  try {
    if (where) {
      const fieldsPath = PipedriveTableNameToFieldEndpointMap[tableName];

      if (!fieldsPath) {
        throw new PipedriveError(
          `Deleting with conditions is not supported for table: ${tableName}`
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

    const useV1Endpoint = usePipedriveV1Endpoint(tableName);
    const searchPath = useV1Endpoint ? `v1/${tableName}` : `${tableName}`;

    const searchParams: Record<string, any> = {};

    if (filterId) {
      searchParams.filter_id = filterId;
    }

    const records = await fetchPipedrivePaginatedRecords<any, Record<string, any>>({
      token,
      method: 'GET',
      path: searchPath,
      params: searchParams,
      maxResults: 500,
      limit: 500,
      object: 'data',
    });

    const recordIds = records?.map((item) => item.id) || [];

    if (recordIds.length === 0) {
      return 0;
    }

    const deletePath = useV1Endpoint ? `v1/${tableName}` : tableName;
    let deletedCount = 0;

    for (const recordId of recordIds) {
      try {
        await pipedriveApiClient({
          token,
          method: 'DELETE',
          path: `${deletePath}/${recordId}`,
        });
        deletedCount++;
      } catch (error) {
        Debugger.log(
          `Failed to delete record with ID ${recordId} in table ${tableName}: ${extractPipedriveError(
            error
          )}`
        );
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof PipedriveError) {
      throw error;
    }
    throw new PipedriveError(
      `Failed to delete records in table ${tableName}: ${extractPipedriveError(error)}`
    );
  } finally {
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
  }
};
