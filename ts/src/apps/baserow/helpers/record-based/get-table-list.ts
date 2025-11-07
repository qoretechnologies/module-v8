import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { BaserowError } from '../../constants';
import { fetchBaserowPaginatedRecords } from '../constants';

export const getBaserowTableList: TQoreGetTableListFunction = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: BaserowError,
  });

  try {
    const tables = await fetchBaserowPaginatedRecords<any, { id: number; name: string }>({
      url,
      token,
      path: `database/tables/all-tables`,
    });

    return tables.map((table) => table.name);
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }

    throw new BaserowError(`Failed to get table list: ${error}`);
  }
};
