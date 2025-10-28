import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { SupabaseError, SupabaseErrorCodeToQoreErrorCodeMap } from '../../constants';
import { createSupabaseClient } from '../constants';

export const createSupabaseRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
  const { projectId, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['projectId', 'token'],
    ErrorClass: SupabaseError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new SupabaseError('Table name is required');
  }

  try {
    const client = createSupabaseClient({ projectId, token });

    const formattedRecords = mapColumnFormatToObject(records);

    const { data, error } = await client.from(tableName).insert(formattedRecords).select();

    if (error) {
      throw new SupabaseError(
        `Failed to create records in table ${tableName}: ${error.details || error.message}`,
        SupabaseErrorCodeToQoreErrorCodeMap[error.code]
      );
    }

    if (!data?.length) {
      throw new SupabaseError(`No record was created in table ${tableName}`);
    }

    return mapObjectToColumnFormat(data);
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(
      `Failed to create records in table ${tableName}: ${error.message || error}`
    );
  }
};
