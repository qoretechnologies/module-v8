import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { baserowClient } from '../../client';
import { BaserowError } from '../../constants';

export const getBaserowTableList: TQoreGetTableListFunction = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  try {
    const tables = await baserowClient.fetchPaginated<{ id: number; name: string }>({
      path: 'database/tables/all-tables',
      token,
      connectionOptions: { url },
    });

    return tables.map((table) => table.name);
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }

    throw new BaserowError(`Failed to get table list: ${error}`);
  }
};
