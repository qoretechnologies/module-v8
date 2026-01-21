/**
 * ClickUp Get Table List
 *
 * Returns all available Lists across all workspaces, spaces, and folders
 * as table paths in the format "workspace|space|list" or "workspace|space|folder|list".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { clickUpClient } from '../../client';
import { ClickUpError } from '../../constants';
import { buildTablePath } from './constants';

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
 * Get all available tables (Lists) across all workspaces and spaces.
 * Returns table names in the format: "workspace|space|list" or "workspace|space|folder|list"
 */
export const getClickUpTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  try {
    const tables: string[] = [];

    // Fetch all workspaces (teams in v2 API)
    const workspacesResponse = await clickUpClient.get<{ teams: TWorkspace[] }>('team', { token });
    const workspaces = workspacesResponse?.teams || [];

    // For each workspace, fetch spaces
    for (const workspace of workspaces) {
      const spacesResponse = await clickUpClient.get<{ spaces: TSpace[] }>(
        `team/${workspace.id}/space`,
        { token }
      );
      const spaces = spacesResponse?.spaces || [];

      // For each space, fetch folderless lists and folders
      for (const space of spaces) {
        // Get folderless lists (lists directly in space)
        const folderlessListsResponse = await clickUpClient.get<{ lists: TList[] }>(
          `space/${space.id}/list`,
          { token }
        );
        const folderlessLists = folderlessListsResponse?.lists || [];

        for (const list of folderlessLists) {
          tables.push(buildTablePath(workspace.name, space.name, undefined, list.name));
        }

        // Get folders and their lists
        const foldersResponse = await clickUpClient.get<{ folders: TFolder[] }>(
          `space/${space.id}/folder`,
          { token }
        );
        const folders = foldersResponse?.folders || [];

        for (const folder of folders) {
          const folderListsResponse = await clickUpClient.get<{ lists: TList[] }>(
            `folder/${folder.id}/list`,
            { token }
          );
          const folderLists = folderListsResponse?.lists || [];

          for (const list of folderLists) {
            tables.push(buildTablePath(workspace.name, space.name, folder.name, list.name));
          }
        }
      }
    }

    return tables;
  } catch (error) {
    if (error instanceof ClickUpError) {
      throw error;
    }

    throw new ClickUpError(`Failed to get table list: ${error}`);
  }
};
