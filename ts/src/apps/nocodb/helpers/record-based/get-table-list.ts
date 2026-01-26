import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { nocodbClient } from '../../client';
import { NocoDBError } from '../../constants';

type NocoDBWorkspace = {
  id: string;
  title: string;
};

type NocoDBBase = {
  id: string;
  title: string;
};

type NocoDBTable = {
  id: string;
  title: string;
};

/**
 * Table name format: "workspaceTitle|baseTitle|tableName"
 * This allows users to select from all available tables without needing
 * to separately select workspace and base in the record-based UI.
 */
export const TABLE_PATH_SEPARATOR = '|';

/**
 * Parse a hierarchical table path into its components
 */
export const parseTablePath = (tablePath: string): { workspaceTitle: string; baseTitle: string; tableName: string } => {
  const parts = tablePath.split(TABLE_PATH_SEPARATOR);
  if (parts.length !== 3) {
    throw new NocoDBError(`Invalid table path format: "${tablePath}". Expected "workspace|base|table".`);
  }
  return {
    workspaceTitle: parts[0],
    baseTitle: parts[1],
    tableName: parts[2],
  };
};

/**
 * Build a hierarchical table path from components
 */
export const buildTablePath = (workspaceTitle: string, baseTitle: string, tableName: string): string => {
  return `${workspaceTitle}${TABLE_PATH_SEPARATOR}${baseTitle}${TABLE_PATH_SEPARATOR}${tableName}`;
};

/**
 * Cache for workspace/base title to ID mappings
 * This is used when resolving table paths to IDs
 */
type NocoDBMappings = {
  workspaces: Map<string, string>; // title -> id
  bases: Map<string, Map<string, string>>; // workspaceId -> (title -> id)
};

let mappingsCache: NocoDBMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Get table ID by parsing the hierarchical table path
 */
export const getNocoDBTableIdByPath = async (options: {
  token: string;
  url: string;
  tablePath: string;
}): Promise<{ baseId: string; tableId: string }> => {
  const { token, url, tablePath } = options;

  const { workspaceTitle, baseTitle, tableName } = parseTablePath(tablePath);

  // Refresh cache if token changed or not initialized
  if (!mappingsCache || mappingsCacheToken !== token) {
    mappingsCache = {
      workspaces: new Map(),
      bases: new Map(),
    };
    mappingsCacheToken = token;

    // Fetch all workspaces
    const workspacesResponse = await nocodbClient.get<{ list: NocoDBWorkspace[] }>('meta/workspaces', {
      token,
      connectionOptions: { url },
    });

    for (const ws of workspacesResponse?.list || []) {
      mappingsCache.workspaces.set(ws.title, ws.id);

      // Fetch bases for each workspace
      const basesResponse = await nocodbClient.get<{ list: NocoDBBase[] }>(`meta/workspaces/${ws.id}/bases`, {
        token,
        connectionOptions: { url },
      });

      const basesMap = new Map<string, string>();
      for (const base of basesResponse?.list || []) {
        basesMap.set(base.title, base.id);
      }
      mappingsCache.bases.set(ws.id, basesMap);
    }
  }

  // Resolve workspace
  const workspaceId = mappingsCache.workspaces.get(workspaceTitle);
  if (!workspaceId) {
    throw new NocoDBError(`Workspace "${workspaceTitle}" not found.`);
  }

  // Resolve base
  const basesMap = mappingsCache.bases.get(workspaceId);
  const baseId = basesMap?.get(baseTitle);
  if (!baseId) {
    throw new NocoDBError(`Base "${baseTitle}" not found in workspace "${workspaceTitle}".`);
  }

  // Resolve table
  const tablesResponse = await nocodbClient.get<{ list: NocoDBTable[] }>(`meta/bases/${baseId}/tables`, {
    token,
    connectionOptions: { url },
  });

  const table = (tablesResponse?.list || []).find((t) => t.title === tableName);
  if (!table) {
    throw new NocoDBError(`Table "${tableName}" not found in base "${baseTitle}".`);
  }

  return { baseId, tableId: table.id };
};

/**
 * Get all available tables across all workspaces and bases
 * Returns table names in the format: "workspace|base|table"
 */
export const getNocoDBTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token, url } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'url'],
    ErrorClass: NocoDBError,
  });

  try {
    const tables: string[] = [];

    // Fetch all workspaces
    const workspacesResponse = await nocodbClient.get<{ list: NocoDBWorkspace[] }>('meta/workspaces', {
      token,
      connectionOptions: { url },
    });

    const workspaces = workspacesResponse?.list || [];

    // For each workspace, fetch bases
    for (const workspace of workspaces) {
      const basesResponse = await nocodbClient.get<{ list: NocoDBBase[] }>(
        `meta/workspaces/${workspace.id}/bases`,
        {
          token,
          connectionOptions: { url },
        }
      );

      const bases = basesResponse?.list || [];

      // For each base, fetch tables
      for (const base of bases) {
        const tablesResponse = await nocodbClient.get<{ list: NocoDBTable[] }>(
          `meta/bases/${base.id}/tables`,
          {
            token,
            connectionOptions: { url },
          }
        );

        const baseTables = tablesResponse?.list || [];

        // Add each table with the hierarchical path
        for (const table of baseTables) {
          tables.push(buildTablePath(workspace.title, base.title, table.title));
        }
      }
    }

    return tables;
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw error;
    }

    throw new NocoDBError(`Failed to get table list: ${error}`);
  }
};
