import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { buildAttioFilter } from './apply-where-condition';
import { attioApiClient } from '../client';

type TAttioRecordQueryResponse = Array<{
  id: {
    record_id: string;
    object_id: string;
    workspace_id: string;
  };
  values: Record<string, any>;
}>;

export const updateAttioRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new AttioError('Table name is required');
  }

  if (!fields || Object.keys(fields).length === 0) {
    throw new AttioError('No fields to update');
  }

  try {
    const filter = where ? buildAttioFilter(where) : undefined;

    const recordIds: string[] = [];
    let offset = 0;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const requestBody: Record<string, any> = {
        limit: pageSize,
        offset,
      };

      if (filter && Object.keys(filter).length > 0) {
        requestBody.filter = filter;
      }

      const response = await attioApiClient<TAttioRecordQueryResponse>({
        path: `/v2/objects/${tableName}/records/query`,
        method: 'POST',
        object: 'data',
        token,
        body: requestBody,
      });

      const records = response || [];

      if (records.length === 0) {
        hasMore = false;
        break;
      }

      recordIds.push(...records.map((r) => r.id.record_id));

      offset += records.length;
      hasMore = records.length === pageSize;
    }

    if (recordIds.length === 0) {
      return 0;
    }

    let updatedCount = 0;

    for (const recordId of recordIds) {
      await attioApiClient({
        path: `/v2/objects/${tableName}/records/${recordId}`,
        method: 'PATCH',
        token,
        body: {
          data: {
            values: fields,
          },
        },
      });

      updatedCount++;
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof AttioError) {
      throw error;
    }
    throw new AttioError(
      `Failed to update records in table ${tableName}: ${error?.message || error}`
    );
  }
};
