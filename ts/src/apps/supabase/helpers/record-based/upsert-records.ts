import { TQoreUpsertSingleRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { SupabaseError, SupabaseErrorCodeToQoreErrorCodeMap } from '../../constants';
import { createSupabaseClient } from '../constants';

export const upsertSupabaseRecord: TQoreUpsertSingleRecordsFunction = async (
  context,
  record,
  opts
) => {
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

    const { error } = await client.from(tableName).upsert(record).select();

    if (error) {
      throw new SupabaseError(
        `Failed to upsert records in table ${tableName}: ${error.details || error.message}`,
        SupabaseErrorCodeToQoreErrorCodeMap[error.code]
      );
    }

    return 'inserted';
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(
      `Failed to upsert records in table ${tableName}: ${error.message || error}`
    );
  }
};
