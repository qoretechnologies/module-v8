import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { baserowClient } from '../../client';
import { BaserowError } from '../../constants';
import { buildBaserowFilter } from './apply-where-condition';
import { getBaserowTableIdByName } from './constants';

export const deleteBaserowRecords: TQoreDeleteRecordsFunction = async (context, where, opts) => {
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

    const recordsToDelete = await baserowClient.fetchPaginated<{ id: number; [key: string]: any }>({
      path: `database/rows/table/${tableId}`,
      token,
      connectionOptions: { url },
      params: filterParams,
      itemsPath: 'results',
    });

    if (!recordsToDelete || recordsToDelete.length === 0) {
      return 0;
    }

    const items = recordsToDelete.map((record) => record.id);

    await baserowClient.post(
      `database/rows/table/${tableId}/batch-delete`,
      { items },
      {
        token,
        connectionOptions: { url },
        params: {
          user_field_names: 'true',
        },
      }
    );

    return recordsToDelete.length;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }
    throw new BaserowError(`Failed to delete records in table ${tableName}: ${error}`);
  }
};
