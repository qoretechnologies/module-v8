import {
  EQoreRecordBasedAppErrorCodes,
  TQoreCreateRecordsFunction,
} from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { ZOHOCRM_DUPLICATE_ERROR_CODE, ZohoCrmError } from '../../constants';
import { zohoCrmApiClient } from '../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';

type TRecordDetails = {
  id: string;
  Modified_Time?: string;
  Created_Time?: string;
};

type TCreateRecordResponse = {
  data: Array<{
    code: string;
    details: TRecordDetails;
    message: string;
    status: string;
  }>;
};

const isSuccess = (status: string): boolean => status.toLowerCase() === 'success';

const handleZohoCrmBatchError = (batchError: any, tableName: string) => {
  let parsedError = batchError;
  const message = batchError.message?.trim();
  const duplicateFieldNames: string[] = [];

  if (message && /^[\[{]/.test(message)) {
    try {
      parsedError = JSON.parse(message);
    } catch {}
  }

  const errors = parsedError?.data;
  if (Array.isArray(errors)) {
    for (const err of errors) {
      if (err.code === ZOHOCRM_DUPLICATE_ERROR_CODE && err.details?.api_name) {
        duplicateFieldNames.push(err.details.api_name);
      }
    }
  }

  if (duplicateFieldNames.length) {
    throw new ZohoCrmError(
      `Failed to create records in module ${tableName} due to duplicate values in fields: ${duplicateFieldNames.join(', ')}`,
      EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD
    );
  }

  throw new ZohoCrmError(
    `Failed to create records in module ${tableName}: ${extractZohoCrmErrorMessage(batchError)}`
  );
};

export const createZohoCrmRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZohoCrmError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new ZohoCrmError('Table name is required');
  }

  try {
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const batchSize = 100;

    const results: (TRecordDetails | null)[] = [];

    for (let i = 0; i < recordsArray.length; i += batchSize) {
      try {
        const response = await zohoCrmApiClient<TCreateRecordResponse>({
          path: tableName,
          method: 'POST',
          token,
          url,
          body: { data: recordsArray.slice(i, i + batchSize) },
        });

        const batchResults = response?.data?.map((recordData) => {
          if (!isSuccess(recordData.status)) {
            Debugger.log(
              `Failed to create record in module ${tableName}: ${recordData.message} (code: ${recordData.code})`
            );
            return null;
          }

          return recordData.details;
        });

        if (batchResults && batchResults.length > 0) {
          results.push(...batchResults);
        }
      } catch (batchError) {
        handleZohoCrmBatchError(batchError, tableName);
      }
    }

    if (!results?.length) {
      throw new ZohoCrmError(`No record was created in table ${tableName}`);
    }

    return mapObjectToColumnFormat(results.filter((res) => res !== null));
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }
    throw new ZohoCrmError(
      `Failed to create records in table ${tableName}: ${extractZohoCrmErrorMessage(error)}`
    );
  }
};
