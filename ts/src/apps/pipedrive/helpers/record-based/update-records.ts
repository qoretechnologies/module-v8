import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
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

export const updatePipedriveRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PipedriveError,
  });

  const tableName = opts?.table as TPipedriveTable;

  if (!tableName) {
    throw new PipedriveError('Table name is required');
  }

  if (!fields || Object.keys(fields).length === 0) {
    throw new PipedriveError('No fields to update');
  }

  let filterId: number | undefined;

  try {
    if (where) {
      const fieldsPath = PipedriveTableNameToFieldEndpointMap[tableName];

      if (!fieldsPath) {
        throw new PipedriveError(
          `Updating with conditions is not supported for table: ${tableName}`
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

    const updatePath = useV1Endpoint ? `v1/${tableName}` : tableName;
    let updatedCount = 0;

    const fieldsToUpdate = omit(fields, 'custom_fields');
    let customFieldsToUpdate: Record<string, any> = {};

    if (fields.custom_fields && typeof fields.custom_fields === 'object') {
      customFieldsToUpdate = fields.custom_fields as Record<string, any>;
    }

    const updateBody = { ...fieldsToUpdate, ...customFieldsToUpdate };

    for (const recordId of recordIds) {
      try {
        await pipedriveApiClient({
          token,
          method: 'PATCH',
          path: `${updatePath}/${recordId}`,
          body: updateBody,
        });
        updatedCount++;
      } catch (error) {
        Debugger.log(
          `Failed to update record with ID ${recordId} in table ${tableName}: ${extractPipedriveError(
            error
          )}`
        );
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof PipedriveError) {
      throw error;
    }
    throw new PipedriveError(
      `Failed to update records in table ${tableName}: ${extractPipedriveError(error)}`
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
