import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { chunk, omit, pick } from 'lodash';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZendeskError } from '../../constants';
import { zendeskApiClient } from '../constants';
import { TZendeskTable } from './get-table-list';
import { isCustomZendeskObject, pollZendeskJobResults } from './constants';
import { getRecordIds, getSingularTableName } from './shared-utils';
import { CUSTOM_OBJECT_STANDARD_FIELDS, ZENDESK_BULK_UPDATE_LIMIT } from './types';

const CUSTOM_FIELD_PREFIX = 'custom_field_';

const isCustomField = (fieldId: string): boolean => {
  return fieldId.startsWith(CUSTOM_FIELD_PREFIX);
};

const getCustomFieldId = (fieldId: string): number | null => {
  if (!isCustomField(fieldId)) {
    return null;
  }

  const match = fieldId.match(/^custom_field_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

const prepareStandardFieldsForUpdate = (setFields: Record<string, any>): Record<string, any> => {
  const formattedRecord: Record<string, any> = {};
  const customFields: { id: number; value: any }[] = [];

  for (const [key, value] of Object.entries(setFields)) {
    if (isCustomField(key)) {
      const fieldId = getCustomFieldId(key);
      if (fieldId) {
        customFields.push({ id: fieldId, value });
      }
    } else {
      formattedRecord[key] = value;
    }
  }

  if (customFields.length > 0) {
    formattedRecord.custom_fields = customFields;
  }

  return formattedRecord;
};

const prepareCustomObjectFieldsForUpdate = (
  setFields: Record<string, any>
): Record<string, any> => {
  return {
    ...pick(setFields, CUSTOM_OBJECT_STANDARD_FIELDS),
    custom_object_fields: {
      ...omit(setFields, CUSTOM_OBJECT_STANDARD_FIELDS),
    },
  };
};

export const updateZendeskRecords: TQoreUpdateRecordsFunction = async (
  context,
  setFields,
  whereConditions,
  updateOptions
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZendeskError,
  });

  const tableName = updateOptions?.table as TZendeskTable;

  if (!tableName) {
    throw new ZendeskError('Table name is required');
  }

  if (!setFields || Object.keys(setFields).length === 0) {
    throw new ZendeskError('No fields to update');
  }

  const isCustomObject = isCustomZendeskObject(tableName);

  try {
    const recordIds = await getRecordIds({ token, url, tableName, whereConditions });

    if (recordIds.length === 0) {
      return 0;
    }

    let updatedCount = 0;

    if (isCustomObject) {
      updatedCount = await updateCustomObjectRecords({
        token,
        url,
        tableName,
        recordIds,
        setFields,
      });
    } else {
      updatedCount = await bulkUpdateStandardRecords({
        token,
        url,
        tableName,
        recordIds,
        setFields,
      });
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof ZendeskError) {
      throw error;
    }

    throw new ZendeskError(`Failed to update records in table ${tableName}: ${error}`);
  }
};

type TZendeskBulkUpdateResponse = {
  id: string;
  status: string;
};

const bulkUpdateStandardRecords = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  recordIds: string[];
  setFields: Record<string, any>;
}): Promise<number> => {
  const { token, url, tableName, recordIds, setFields } = options;
  const singularName = getSingularTableName(tableName);

  const batches = chunk(recordIds, ZENDESK_BULK_UPDATE_LIMIT);
  let updatedCount = 0;

  const preparedFields = prepareStandardFieldsForUpdate(setFields);

  for (const batch of batches) {
    try {
      const response = await zendeskApiClient<TZendeskBulkUpdateResponse>({
        path: `${tableName}/update_many.json`,
        method: 'PUT',
        token,
        url,
        params: {
          ids: batch.join(','),
        },
        body: { [singularName]: preparedFields },
        object: 'job_status',
      });

      const results = await pollZendeskJobResults({
        token,
        url,
        jobId: response.id,
      });

      updatedCount += results.filter((r) => r.success === true).length;
    } catch (error) {
      Debugger.log(`Failed to bulk update ${tableName} batch: ${error}`);
    }
  }

  return updatedCount;
};

const updateCustomObjectRecords = async (options: {
  token: string;
  url: string;
  tableName: TZendeskTable;
  recordIds: string[];
  setFields: Record<string, any>;
}): Promise<number> => {
  const { token, url, tableName, recordIds, setFields } = options;
  const preparedFields = prepareCustomObjectFieldsForUpdate(setFields);
  let updatedCount = 0;

  for (const recordId of recordIds) {
    try {
      await zendeskApiClient<Record<string, any>>({
        path: `custom_objects/${tableName}/records/${recordId}`,
        method: 'PATCH',
        token,
        url,
        body: { custom_object_record: preparedFields },
      });

      updatedCount++;
    } catch (error) {
      Debugger.log(`Failed to update custom object ${tableName} record ${recordId}: ${error}`);
    }
  }

  return updatedCount;
};
