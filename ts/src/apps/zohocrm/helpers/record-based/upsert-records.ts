import {
  TQoreUpsertRecordsFunction,
  TQoreUpsertRecordsResultCode,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { ZohoCrmError } from '../../constants';
import { zohoCrmApiClient } from '../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';

type TUpsertRecordResponse = {
  data: Array<{
    code: string;
    message: 'record updated' | 'record added';
  }>;
};

const upsertRecordMessageToStatus: Record<string, TQoreUpsertRecordsResultCode> = {
  'record updated': 'updated',
  'record added': 'inserted',
} as const;

export const upsertZohoCrmRecords: TQoreUpsertRecordsFunction = async (context, records, opts) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZohoCrmError,
  });

  const tableName = opts?.table;
  const duplicateCheckFields = opts?.duplicate_check_fields as string[] | undefined;

  if (!tableName) {
    throw new ZohoCrmError('Table name is required');
  }

  try {
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const batchSize = 100;

    const results: TQoreUpsertRecordsResultCode[] = [];

    for (let i = 0; i < recordsArray.length; i += batchSize) {
      try {
        const response = await zohoCrmApiClient<TUpsertRecordResponse>({
          path: `${tableName}/upsert`,
          method: 'POST',
          token,
          url,
          body: {
            data: recordsArray.slice(i, i + batchSize),
            ...(duplicateCheckFields && { duplicate_check_fields: duplicateCheckFields }),
          },
        });

        results.push(
          ...response?.data?.map(
            (recordData) => upsertRecordMessageToStatus[recordData.message] || 'unchanged'
          )
        );
      } catch (batchError) {
        throw new ZohoCrmError(
          `Failed to upsert records in module ${tableName}: ${extractZohoCrmErrorMessage(batchError)}`
        );
      }
    }

    if (!results?.length) {
      throw new ZohoCrmError(`No records were upserted in table ${tableName}`);
    }

    return results;
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(
      `Failed to upsert records in table ${tableName}: ${extractZohoCrmErrorMessage(error)}`
    );
  }
};
