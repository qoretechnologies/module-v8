/**
 * ClickUp Record-Based Helpers Constants
 *
 * This module provides utilities for working with ClickUp's hierarchical structure
 * in a record-based context where Lists are treated as "tables" and Tasks as "records".
 *
 * ClickUp hierarchy: Workspace -> Space -> Folder (optional) -> List -> Task
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';

/**
 * Table path separator for hierarchical paths
 */
export const TABLE_PATH_SEPARATOR = '|';

/**
 * Parsed table path components
 */
export interface ClickUpTablePath {
  workspaceName: string;
  spaceName: string;
  folderName?: string;
  listName: string;
}

/**
 * Parse a hierarchical table path into its components.
 * Supports both folderless lists (workspace|space|list) and lists in folders (workspace|space|folder|list).
 */
export const parseTablePath = (tablePath: string): ClickUpTablePath => {
  const parts = tablePath.split(TABLE_PATH_SEPARATOR);

  if (parts.length === 3) {
    // workspace|space|list (folderless)
    return {
      workspaceName: parts[0],
      spaceName: parts[1],
      listName: parts[2],
    };
  } else if (parts.length === 4) {
    // workspace|space|folder|list
    return {
      workspaceName: parts[0],
      spaceName: parts[1],
      folderName: parts[2],
      listName: parts[3],
    };
  }

  throw new ClickUpError(
    `Invalid table path format: "${tablePath}". Expected "workspace|space|list" or "workspace|space|folder|list".`
  );
};

/**
 * Build a hierarchical table path from components
 */
export const buildTablePath = (
  workspaceName: string,
  spaceName: string,
  folderName: string | undefined,
  listName: string
): string => {
  if (folderName) {
    return `${workspaceName}${TABLE_PATH_SEPARATOR}${spaceName}${TABLE_PATH_SEPARATOR}${folderName}${TABLE_PATH_SEPARATOR}${listName}`;
  }
  return `${workspaceName}${TABLE_PATH_SEPARATOR}${spaceName}${TABLE_PATH_SEPARATOR}${listName}`;
};

/**
 * Cache for workspace/space/folder mappings to avoid repeated API calls
 */
type ClickUpMappings = {
  workspaces: Map<string, string>; // name -> id
  spaces: Map<string, Map<string, string>>; // workspaceId -> (name -> id)
  folders: Map<string, Map<string, string>>; // spaceId -> (name -> id)
  folderlessLists: Map<string, Map<string, string>>; // spaceId -> (name -> id)
  folderLists: Map<string, Map<string, string>>; // folderId -> (name -> id)
};

let mappingsCache: ClickUpMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheToken = null;
};

/**
 * ClickUp API response types
 */
type TWorkspace = {
  id: string;
  name: string;
};

type TSpace = {
  id: string;
  name: string;
};

type TFolder = {
  id: string;
  name: string;
};

type TList = {
  id: string;
  name: string;
};

/**
 * Get list ID by parsing the hierarchical table path.
 * Also returns workspace ID for operations that need it.
 */
export const getClickUpListIdByPath = async (options: {
  token: string;
  tablePath: string;
}): Promise<{ listId: string; workspaceId: string; spaceId: string }> => {
  const { token, tablePath } = options;
  const { workspaceName, spaceName, folderName, listName } = parseTablePath(tablePath);

  // Refresh cache if token changed or not initialized
  if (!mappingsCache || mappingsCacheToken !== token) {
    mappingsCache = {
      workspaces: new Map(),
      spaces: new Map(),
      folders: new Map(),
      folderlessLists: new Map(),
      folderLists: new Map(),
    };
    mappingsCacheToken = token;

    // Fetch all workspaces (teams in v2 API)
    const workspacesResponse = await clickUpClient.get<{ teams: TWorkspace[] }>('team', { token });
    const workspaces = workspacesResponse?.teams || [];

    for (const ws of workspaces) {
      mappingsCache.workspaces.set(ws.name, ws.id);

      // Fetch spaces for each workspace
      const spacesResponse = await clickUpClient.get<{ spaces: TSpace[] }>(
        `team/${ws.id}/space`,
        { token }
      );
      const spaces = spacesResponse?.spaces || [];

      const spacesMap = new Map<string, string>();
      for (const space of spaces) {
        spacesMap.set(space.name, space.id);

        // Fetch folderless lists for each space
        const folderlessListsResponse = await clickUpClient.get<{ lists: TList[] }>(
          `space/${space.id}/list`,
          { token }
        );
        const folderlessLists = folderlessListsResponse?.lists || [];
        const folderlessListsMap = new Map<string, string>();
        for (const list of folderlessLists) {
          folderlessListsMap.set(list.name, list.id);
        }
        mappingsCache.folderlessLists.set(space.id, folderlessListsMap);

        // Fetch folders for each space
        const foldersResponse = await clickUpClient.get<{ folders: TFolder[] }>(
          `space/${space.id}/folder`,
          { token }
        );
        const folders = foldersResponse?.folders || [];
        const foldersMap = new Map<string, string>();

        for (const folder of folders) {
          foldersMap.set(folder.name, folder.id);

          // Fetch lists for each folder
          const folderListsResponse = await clickUpClient.get<{ lists: TList[] }>(
            `folder/${folder.id}/list`,
            { token }
          );
          const folderLists = folderListsResponse?.lists || [];
          const folderListsMap = new Map<string, string>();
          for (const list of folderLists) {
            folderListsMap.set(list.name, list.id);
          }
          mappingsCache.folderLists.set(folder.id, folderListsMap);
        }
        mappingsCache.folders.set(space.id, foldersMap);
      }
      mappingsCache.spaces.set(ws.id, spacesMap);
    }
  }

  // Resolve workspace
  const workspaceId = mappingsCache.workspaces.get(workspaceName);
  if (!workspaceId) {
    throw new ClickUpError(`Workspace "${workspaceName}" not found.`);
  }

  // Resolve space
  const spacesMap = mappingsCache.spaces.get(workspaceId);
  const spaceId = spacesMap?.get(spaceName);
  if (!spaceId) {
    throw new ClickUpError(`Space "${spaceName}" not found in workspace "${workspaceName}".`);
  }

  // Resolve list (either from folder or folderless)
  let listId: string | undefined;

  if (folderName) {
    // List is in a folder
    const foldersMap = mappingsCache.folders.get(spaceId);
    const folderId = foldersMap?.get(folderName);
    if (!folderId) {
      throw new ClickUpError(`Folder "${folderName}" not found in space "${spaceName}".`);
    }

    const folderListsMap = mappingsCache.folderLists.get(folderId);
    listId = folderListsMap?.get(listName);
    if (!listId) {
      throw new ClickUpError(`List "${listName}" not found in folder "${folderName}".`);
    }
  } else {
    // Folderless list
    const folderlessListsMap = mappingsCache.folderlessLists.get(spaceId);
    listId = folderlessListsMap?.get(listName);
    if (!listId) {
      throw new ClickUpError(
        `List "${listName}" not found in space "${spaceName}". ` +
        `If the list is in a folder, use the format "workspace|space|folder|list".`
      );
    }
  }

  return { listId, workspaceId, spaceId };
};

/**
 * Maps ClickUp custom field types to Qore types
 */
export const mapClickUpFieldTypeToQore = (clickUpType: string): TQoreType => {
  const typeMap: Record<string, TQoreType> = {
    text: 'string',
    short_text: 'string',
    email: 'string',
    phone: 'string',
    url: 'string',
    drop_down: 'string',
    number: 'number',
    currency: 'number',
    percentage: 'number',
    automatic_progress: 'number',
    manual_progress: 'number',
    date: 'date',
    checkbox: 'bool',
    rating: 'int',
    labels: { type: 'list', element_type: 'string' },
    users: { type: 'list', element_type: 'string' },
    emoji: 'string',
    location: 'string',
    formula: 'any',
    rollup: 'any',
    relationship: { type: 'list', element_type: 'string' },
  };

  return typeMap[clickUpType] || 'any';
};

/**
 * Maps Qore expression operators to ClickUp custom field operators
 */
export const EXPRESSION_TO_CLICKUP_OP: Record<string, string> = {
  '==': '=',
  '!=': '!=',
  '>': '>',
  '>=': '>=',
  '<': '<',
  '<=': '<=',
  'is-set': 'IS SET',
  'is-not-set': 'IS NOT SET',
  'any-of': 'ANY',
  'all-of': 'ALL',
  range: 'RANGE',
};

/**
 * Standard task fields that can be filtered via query parameters
 */
export const STANDARD_FILTERABLE_FIELDS = [
  'status',
  'assignees',
  'tags',
  'priority',
  'due_date',
  'start_date',
  'date_created',
  'date_updated',
] as const;

/**
 * Maximum page size for ClickUp API
 */
export const MAX_PAGE_SIZE = 100;
