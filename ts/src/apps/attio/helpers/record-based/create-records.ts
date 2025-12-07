import {
  EQoreRecordBasedAppErrorCodes,
  TQoreCreateRecordsFunction,
} from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { AttioError, extractAttioErrorMessage, isAttioDuplicateError } from '../../constants';
import { attioApiClient } from '../client';
import { formatAttioResponse, TAttioRecordAttributes } from '../format-response';

export const createAttioRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new AttioError('Table name is required');
  }

  try {
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const table = tableName.includes(' [') ? tableName.split(' [')[0] : tableName;
    const target = tableName.includes(' [') ? 'lists' : 'objects';

    const path = target === 'objects' ? `objects/${table}/records` : `lists/${table}/entries`;

    const createdRecords: Array<TAttioRecordAttributes> = [];

    for (const record of recordsArray) {
      const requestBody = {
        data: {
          values: record,
        },
      };

      const response = await attioApiClient<TAttioRecordAttributes>({
        path,
        method: 'POST',
        object: 'data',
        token,
        body: requestBody,
      });

      createdRecords.push(response);
    }

    if (!createdRecords.length) {
      throw new AttioError(`No records were created in table ${tableName}`);
    }

    const formattedRecords = await formatAttioResponse(
      {
        data: createdRecords,
      },
      target,
      table,
      token
    );

    return mapObjectToColumnFormat(formattedRecords as Record<string, any>[]);
  } catch (error) {
    if (isAttioDuplicateError(error)) {
      throw new AttioError(
        `Duplicate record error: ${extractAttioErrorMessage(error)}`,
        EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD
      );
    }

    if (error instanceof AttioError) {
      throw error;
    }
    throw new AttioError(
      `Failed to create records in table ${tableName}: ${extractAttioErrorMessage(error)}`
    );
  }
};
