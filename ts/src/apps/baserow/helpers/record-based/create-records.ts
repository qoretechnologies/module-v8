import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { BaserowError } from '../../constants';
import { baserowApiClient } from '../constants';
import { getBaserowTableIdByName } from './constants';

export const createBaserowRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  const table = options?.table;

  if (!table) {
    throw new BaserowError('Table name is required to create records.');
  }

  try {
    const tableId = await getBaserowTableIdByName({ token, url, tableName: table });
    const items = mapColumnFormatToObject(records);

    const createdRecords = await baserowApiClient<{ items: Record<string, any>[] }>({
      path: `database/rows/table/${tableId}/batch`,
      method: 'POST',
      token,
      url,
      params: {
        user_field_names: 'true',
      },
      body: {
        items,
      },
    });

    return mapObjectToColumnFormat(createdRecords.items);
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }

    throw new BaserowError(`Failed to create records: ${error}`);
  }
};
