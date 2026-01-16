import { nocodbClient } from '../../client';
import { NocoDBError } from '../../constants';

/**
 * Gets a map of table names to their IDs for a given base
 */
export const getNocoDBTableNameToIdMap = async (options: {
  token: string;
  url: string;
  baseId: string;
}): Promise<Record<string, string>> => {
  try {
    const { token, url, baseId } = options;

    // Fetch all tables for the given base
    const response = await nocodbClient.get<{ list: Array<{ id: string; title: string }> }>(
      `meta/bases/${baseId}/tables`,
      {
        token,
        connectionOptions: { url },
      }
    );

    const map: Record<string, string> = {};
    const tables = response?.list || [];

    tables.forEach((table) => {
      if (table.title && table.id) {
        map[table.title] = table.id;
      }
    });

    return map;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to get table name to ID map: ${error}`);
  }
};

/**
 * Gets a table ID by its name
 */
export const getNocoDBTableIdByName = async (options: {
  token: string;
  url: string;
  baseId: string;
  tableName: string;
}): Promise<string> => {
  try {
    const { token, url, baseId, tableName } = options;

    const tableNameToIdMap = await getNocoDBTableNameToIdMap({ token, url, baseId });

    const tableId = tableNameToIdMap[tableName];
    if (!tableId) {
      throw new NocoDBError(`Table with name "${tableName}" not found.`);
    }

    return tableId;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to get table ID by name: ${error}`);
  }
};
