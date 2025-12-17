import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { chunk } from 'lodash';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZendeskError } from '../../constants';
import { zendeskApiClient } from '../constants';
import { TZendeskTable } from './get-table-list';
import { isCustomZendeskObject, pollZendeskJobResults } from './constants';
import { getRecordIds } from './shared-utils';
import { ZENDESK_BULK_DELETE_LIMIT } from './types';

export const deleteZendeskRecords: TQoreDeleteRecordsFunction = async (
  context,
  whereConditions,
  deleteOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZendeskError,
  });

  const tableName = deleteOptions?.table as TZendeskTable;

  if (!tableName) {
    throw new ZendeskError('Table name is required');
  }

  const isCustomObject = isCustomZendeskObject(tableName);

  try {
    const recordIds = await getRecordIds({ token, url, tableName, whereConditions });

    if (recordIds.length === 0) {
      return 0;
    }

    let deletedCount = 0;

    if (isCustomObject) {
      deletedCount = await deleteCustomObjectRecords({ token, url, tableName, recordIds });
    } else {
      deletedCount = await bulkDeleteStandardRecords({ token, url, tableName, recordIds });
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof ZendeskError) {
      throw error;
    }

    throw new ZendeskError(`Failed to delete records in table ${tableName}: ${error}`);
  }
};

type TZendeskBulkDeleteResponse = {
  id: string;
  status: string;
};

const bulkDeleteStandardRecords = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  recordIds: string[];
}): Promise<number> => {
  const { token, url, tableName, recordIds } = options;

  const batches = chunk(recordIds, ZENDESK_BULK_DELETE_LIMIT);
  let deletedCount = 0;

  for (const batch of batches) {
    try {
      const response = await zendeskApiClient<TZendeskBulkDeleteResponse>({
        path: `${tableName}/destroy_many.json`,
        method: 'DELETE',
        token,
        url,
        params: {
          ids: batch.join(','),
        },
        object: 'job_status',
      });

      const results = await pollZendeskJobResults({
        token,
        url,
        jobId: response.id,
      });

      deletedCount += results.filter((r) => r.success === true).length;
    } catch (error) {
      Debugger.log(`Failed to bulk delete ${tableName} batch: ${error}`);
    }
  }

  return deletedCount;
};

const deleteCustomObjectRecords = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  recordIds: string[];
}): Promise<number> => {
  const { token, url, tableName, recordIds } = options;
  let deletedCount = 0;

  for (const recordId of recordIds) {
    try {
      await zendeskApiClient<void>({
        path: `custom_objects/${tableName}/records/${recordId}`,
        method: 'DELETE',
        token,
        url,
      });

      deletedCount++;
    } catch (error) {
      Debugger.log(`Failed to delete custom object ${tableName} record ${recordId}: ${error}`);
    }
  }

  return deletedCount;
};
