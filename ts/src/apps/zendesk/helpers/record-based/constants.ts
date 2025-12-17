import { omit } from 'lodash';
import { getZendeskFieldToIdToNameMap } from '../get-object-custom-fields';
import { TZendeskTable, ZENDESK_SUPPORTED_TABLES } from './get-table-list';
import { ZendeskError } from '../../constants';
import { zendeskApiClient } from '../constants';

export const isCustomZendeskObject = (tableName: TZendeskTable): boolean => {
  return ZENDESK_SUPPORTED_TABLES.includes(tableName as any) === false;
};

export const formatZendeskRecordsResponse = async (options: {
  records: Record<string, any>[];
  token: string;
  url: string;
  tableName: TZendeskTable;
}): Promise<Record<string, any>[]> => {
  const { records, tableName, token, url } = options;
  const isCustomObject = isCustomZendeskObject(tableName);

  const fieldIdToNameMap = await getZendeskFieldToIdToNameMap({
    token,
    url,
    object: tableName,
  });

  return records.map((record) => {
    const formattedRecord: Record<string, any> = omit(record, [
      'custom_fields',
      'fields',
      'url',
      'custom_object_fields',
    ]);
    const customFields: { id: number; value: any }[] = isCustomObject
      ? record['custom_object_fields']
      : record['custom_fields'];

    if (isCustomObject) {
      return {
        ...formattedRecord,
        ...customFields,
      };
    }

    if (customFields?.length) {
      for (const { id, value } of customFields) {
        const fieldName = fieldIdToNameMap[id];
        if (fieldName) {
          formattedRecord[fieldName] = value;
        }
      }
    }
    return formattedRecord;
  });
};

type TZendeskResultItem = {
  id: string;
  success?: boolean;
  status?: string;
};

export const pollZendeskJobResults = async (options: {
  token: string;
  url: string;
  jobId: string;
}): Promise<TZendeskResultItem[]> => {
  const { token, url, jobId } = options;

  try {
    // max wait time is 5 minutes
    const maxAttempts = 30;
    const delayBetweenAttemptsMs = 10 * 1000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await zendeskApiClient<{ status: string; results: TZendeskResultItem[] }>({
        token,
        url,
        path: `job_statuses/${jobId}.json`,
        object: 'job_status',
      });

      if (response.status === 'completed') {
        return response.results;
      } else if (response.status === 'failed') {
        throw new ZendeskError(`Zendesk job ${jobId} failed`);
      }

      await new Promise((resolve) => setTimeout(resolve, delayBetweenAttemptsMs));
    }

    throw new ZendeskError(`Zendesk job ${jobId} did not complete within the expected time frame`);
  } catch (error) {
    if (error instanceof ZendeskError) {
      throw error;
    }

    throw new ZendeskError(`Failed to poll Zendesk job ${jobId} results: ${error}`);
  }
};
