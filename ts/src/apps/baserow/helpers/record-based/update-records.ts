import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { BaserowError } from '../../constants';
import { baserowApiClient, fetchBaserowPaginatedRecords } from '../constants';
import { buildBaserowFilter } from './apply-where-condition';
import { getBaserowTableIdByName } from './constants';

export const updateBaserowRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new BaserowError('Table name is required');
  }

  try {
    const tableId = await getBaserowTableIdByName({ token, url, tableName });

    const filterParams: Record<string, string> = {
      user_field_names: 'true',
    };

    if (where) {
      const filterGroup = buildBaserowFilter(where);
      filterParams.filters = JSON.stringify(filterGroup);
    }

    const recordsToUpdate = await fetchBaserowPaginatedRecords<
      any,
      { id: number; [key: string]: any }
    >({
      token,
      url,
      path: `database/rows/table/${tableId}`,
      params: filterParams,
      object: 'results',
    });

    if (!recordsToUpdate || recordsToUpdate.length === 0) {
      return 0;
    }

    const items = recordsToUpdate.map((record) => ({
      id: record.id,
      ...fields,
    }));

    await baserowApiClient({
      token,
      url,
      path: `database/rows/table/${tableId}/batch`,
      method: 'PATCH',
      params: {
        user_field_names: 'true',
      },
      body: {
        items,
      },
    });

    return recordsToUpdate.length;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }
    throw new BaserowError(`Failed to update records in table ${tableName}: ${error}`);
  }
};
