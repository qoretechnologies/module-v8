import {
  EQoreRecordBasedAppErrorCodes,
  TQoreCreateRecordsFunction,
} from '@qoretechnologies/ts-toolkit';
import { omit, pick } from 'lodash';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { ZendeskError } from '../../constants';
import { fetchZendeskPaginatedRecords, zendeskApiClient } from '../constants';
import {
  formatZendeskRecordsResponse,
  isCustomZendeskObject,
  pollZendeskJobResults,
} from './constants';
import { TZendeskTable } from './get-table-list';

type TZendeskCreateResponse = {
  id: string;
  status: string;
  job_type: string;
};

const isCustomField = (fieldId: string): boolean => {
  return fieldId.startsWith('custom_field_');
};

const getCustomFieldId = (fieldId: string): number | null => {
  if (!isCustomField(fieldId)) {
    return null;
  }

  const parts = fieldId.split('_');
  const idPart = parts[2];
  const id = parseInt(idPart, 10);
  return isNaN(id) ? null : id;
};

const prepareSingleRecordForCreate = (options: {
  record: Record<string, any>;
  tableName: TZendeskTable;
}): Record<string, any> => {
  const { record, tableName } = options;
  const prepared: Record<string, any> = { ...record };
  const formattedRecord: Record<string, any> = {};
  const isCustomObject = isCustomZendeskObject(tableName);

  if (isCustomObject) {
    const defaultFields = ['name', 'external_id'];

    return {
      ...pick(record, defaultFields),
      custom_object_fields: {
        ...omit(record, defaultFields),
      },
    };
  }

  const [customFields, standardFields] = Object.entries(prepared).reduce(
    (acc, [key, value]) => {
      if (isCustomField(key)) {
        acc[0].push([key, value]);
      } else {
        acc[1].push([key, value]);
      }
      return acc;
    },
    [[] as [string, any][], [] as [string, any][]]
  );

  // Process standard fields
  for (const [key, value] of standardFields) {
    formattedRecord[key as string] = value;
  }

  // Process custom fields
  if (customFields.length > 0) {
    formattedRecord['custom_fields'] = customFields.map(([key, value]) => {
      const fieldId = getCustomFieldId(key);
      return {
        id: fieldId,
        value,
      };
    });
  }

  if (tableName === 'tickets') {
    if (prepared.description && !prepared.comment) {
      formattedRecord.comment = { body: prepared.description };
      delete prepared.description;
    }
  }

  return formattedRecord;
};

const prepareRecordsForCreate = (options: {
  token: string;
  url: string;
  records: Record<string, any>[];
  tableName: TZendeskTable;
}): Record<string, any>[] => {
  const { records, tableName } = options;

  return records.map((record) => prepareSingleRecordForCreate({ record, tableName }));
};

export const createZendeskRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZendeskError,
  });

  const tableName = opts?.table as TZendeskTable;

  if (!tableName) {
    throw new ZendeskError('Table name is required');
  }

  const isCustomObject = isCustomZendeskObject(tableName);

  let createdRecords: Record<string, any>[] = [];

  try {
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const preparedRecords = prepareRecordsForCreate({
      records: recordsArray,
      tableName,
      token,
      url,
    });

    const path = isCustomObject ? `custom_objects/${tableName}/jobs` : `${tableName}/create_many`;
    const body = isCustomObject
      ? { job: { action: 'create', items: preparedRecords } }
      : { [tableName]: preparedRecords };

    if (isCustomObject) {
      const createCustomObjectsPromises = preparedRecords.map(async (record) => {
        const body = { custom_object_record: record };

        const response = await zendeskApiClient<Record<string, any>>({
          path: `custom_objects/${tableName}/records`,
          method: 'POST',
          token,
          url,
          body,
          object: 'custom_object_record',
        });

        return response;
      });

      createdRecords = await Promise.all(createCustomObjectsPromises);
    } else {
      const response = await zendeskApiClient<TZendeskCreateResponse>({
        path,
        method: 'POST',
        token,
        url,
        body,
        object: 'job_status',
      });

      const job = response;

      const results = await pollZendeskJobResults({
        token,
        url,
        jobId: job.id,
      });

      const resultsIds = results.map((item) => item.id);

      createdRecords = await fetchZendeskPaginatedRecords<
        Record<string, any>[],
        Record<string, any>
      >({
        token,
        url,
        path: isCustomObject
          ? `custom_objects/${tableName}/records`
          : `${tableName}/show_many.json`,
        params: isCustomObject
          ? {
              'filter[ids]': resultsIds.join(','),
            }
          : {
              ids: resultsIds.join(','),
            },
        object: tableName,
      });
    }

    if (!createdRecords?.length) {
      throw new ZendeskError('Failed to retrieve created records after job completion');
    }

    const formattedRecords = await formatZendeskRecordsResponse({
      records: createdRecords,
      tableName,
      token,
      url,
    });

    return mapObjectToColumnFormat(formattedRecords);
  } catch (error) {
    if (isDuplicateError(error)) {
      throw new ZendeskError(
        `Failed to create record in ${tableName}: Duplicate record detected`,
        EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD
      );
    }
    if (error instanceof ZendeskError) {
      throw error;
    }
    throw new ZendeskError(`Failed to create records in table ${tableName}: ${error}`);
  }
};

const isDuplicateError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  const errorDetails = error?.response?.data?.details || {};

  if (message.includes('duplicate') || message.includes('already exists')) {
    return true;
  }

  for (const field of Object.values(errorDetails)) {
    if (Array.isArray(field)) {
      for (const err of field) {
        if (err?.error === 'DuplicateValue' || err?.description?.includes('already exists')) {
          return true;
        }
      }
    }
  }

  return false;
};
