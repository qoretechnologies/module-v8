import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { baserowClient } from '../../client';
import { BaserowError } from '../../constants';
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

    const recordsToUpdate = await baserowClient.fetchPaginated<{ id: number; [key: string]: any }>({
      path: `database/rows/table/${tableId}`,
      token,
      connectionOptions: { url },
      params: filterParams,
      itemsPath: 'results',
    });

    if (!recordsToUpdate || recordsToUpdate.length === 0) {
      return 0;
    }

    const items = recordsToUpdate.map((record) => ({
      id: record.id,
      ...fields,
    }));

    await baserowClient.patch(
      `database/rows/table/${tableId}/batch`,
      { items },
      {
        token,
        connectionOptions: { url },
        params: {
          user_field_names: 'true',
        },
      }
    );

    return recordsToUpdate.length;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }
    throw new BaserowError(`Failed to update records in table ${tableName}: ${error}`);
  }
};
