import { baserowClient } from '../../client';
import { BaserowError } from '../../constants';

export const getBaserowTableNameToIdMap = async (options: {
  token: string;
  url: string;
}): Promise<Record<string, number>> => {
  try {
    const { token, url } = options;

    const tables = await baserowClient.fetchPaginated<{ id: number; name: string }>({
      path: 'database/tables/all-tables',
      token,
      connectionOptions: { url },
    });

    const map: Record<string, number> = {};
    tables.forEach((table) => {
      if (table.name && table.id) {
        map[table.name] = table.id;
      }
    });

    return map;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }

    throw new BaserowError(`Failed to get table name to ID map: ${error}`);
  }
};

export const getBaserowTableIdByName = async (options: {
  token: string;
  url: string;
  tableName: string;
}): Promise<number> => {
  try {
    const { token, url, tableName } = options;

    const tableNameToIdMap = await getBaserowTableNameToIdMap({ token, url });

    const tableId = tableNameToIdMap[tableName];
    if (!tableId) {
      throw new BaserowError(`Table with name "${tableName}" not found.`);
    }

    return tableId;
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }

    throw new BaserowError(`Failed to get table ID by name: ${error}`);
  }
};
