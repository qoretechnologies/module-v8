/**
 * Asana Get Table List
 *
 * Returns all available Projects across all workspaces as table paths
 * in the format "workspaceName|projectName".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { asanaClient } from '../../client';
import { AsanaError, buildTablePath } from './constants';

type TWorkspace = {
  gid: string;
  name: string;
};

type TProject = {
  gid: string;
  name: string;
};

/**
 * Get all available tables (Projects) across all workspaces.
 * Returns table names in the format: "workspaceName|projectName"
 */
export const getAsanaTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: AsanaError,
  });

  try {
    const tables: string[] = [];

    // Fetch all workspaces
    const workspacesResponse = await asanaClient.get<{ data: TWorkspace[] }>('workspaces', {
      token,
    });
    const workspaces = workspacesResponse?.data || [];

    // For each workspace, fetch projects
    for (const workspace of workspaces) {
      const projectsResponse = await asanaClient.get<{ data: TProject[] }>(
        `workspaces/${workspace.gid}/projects`,
        { token }
      );
      const projects = projectsResponse?.data || [];

      for (const project of projects) {
        tables.push(buildTablePath(workspace.name, project.name));
      }
    }

    return tables;
  } catch (error) {
    if (error instanceof AsanaError) {
      throw error;
    }

    throw new AsanaError(`Failed to get table list: ${error}`);
  }
};
