import { TQoreUpsertRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { attioApiClient } from '../client';

type TAttioAssertRecordResponse = {
  id: {
    record_id: string;
    object_id: string;
    workspace_id: string;
  };
  values: Record<string, any>;
};

export const upsertAttioRecords: TQoreUpsertRecordsFunction = async (context, records, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  const tableName = opts?.table;
  const matching_attribute = opts?.matching_attribute;

  if (!matching_attribute) {
    throw new AttioError('Matching attribute is required for upsert operation');
  }

  if (!tableName) {
    throw new AttioError('Table name is required');
  }

  try {
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);

    const results: Array<'inserted' | 'updated' | 'verified' | 'unchanged' | 'deleted'> = [];

    for (const record of recordsArray) {
      const requestBody = {
        data: {
          values: record,
        },
      };

      await attioApiClient<TAttioAssertRecordResponse>({
        path: `/v2/objects/${tableName}/records`,
        method: 'PUT',
        token,
        body: requestBody,
        params: {
          matching_attribute,
        },
      });

      results.push('updated');
    }

    if (!results.length) {
      throw new AttioError(`No records were upserted in table ${tableName}`);
    }

    return results;
  } catch (error) {
    if (error instanceof AttioError) {
      throw error;
    }
    throw new AttioError(
      `Failed to upsert records in table ${tableName}: ${error?.message || error}`
    );
  }
};
