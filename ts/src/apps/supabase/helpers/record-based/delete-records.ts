import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { SupabaseError, SupabaseErrorCodeToQoreErrorCodeMap } from '../../constants';
import { createSupabaseClient } from '../constants';
import { applySupabaseWhereCondition } from './apply-where-condition';

export const deleteSupabaseRecords: TQoreDeleteRecordsFunction = async (context, where, opts) => {
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
    let deleteQuery = client.from(tableName).delete({ count: 'exact' });

    if (where) {
      deleteQuery = applySupabaseWhereCondition(deleteQuery, where);
    }

    const { error, count } = await deleteQuery.select();

    if (error) {
      throw new SupabaseError(
        `Failed to delete records in table ${tableName}: ${error.details || error.message}`,
        SupabaseErrorCodeToQoreErrorCodeMap[error.code]
      );
    }

    return count || 0;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(
      `Failed to delete records in table ${tableName}: ${error.message || error}`
    );
  }
};
