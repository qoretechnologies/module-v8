/**
 * Asana Record-Based Helpers Constants
 *
 * This module provides utilities for working with Asana's hierarchical structure
 * in a record-based context where Projects are treated as "tables" and Tasks as "records".
 *
 * Asana hierarchy: Workspace -> Project -> Section -> Task
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { asanaClient } from '../../client';

/**
 * Custom error class for Asana operations
 */
export class AsanaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AsanaError';
  }
}

/**
 * Table path separator for hierarchical paths
 */
export const TABLE_PATH_SEPARATOR = '|';

/**
 * Maximum page size for Asana API
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Custom field prefix for distinguishing custom fields from standard fields
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Parsed table path components
 */
export interface AsanaTablePath {
  workspaceName: string;
  projectName: string;
}

/**
 * Custom field info structure
 */
export interface TCustomFieldInfo {
  gid: string;
  name: string;
  type: string;
  enumOptions?: Array<{ gid: string; name: string; enabled: boolean; color?: string }>;
}

/**
 * Parse a hierarchical table path into its components.
 * Format: "workspaceName|projectName"
 */
export const parseTablePath = (tablePath: string): AsanaTablePath => {
  const parts = tablePath.split(TABLE_PATH_SEPARATOR);

  if (parts.length !== 2) {
    throw new AsanaError(
      `Invalid table path format: "${tablePath}". Expected "workspaceName|projectName".`
    );
  }

  return {
    workspaceName: parts[0],
    projectName: parts[1],
  };
};

/**
 * Build a hierarchical table path from components
 */
export const buildTablePath = (workspaceName: string, projectName: string): string => {
  return `${workspaceName}${TABLE_PATH_SEPARATOR}${projectName}`;
};

/**
 * Cache for workspace/project/custom field mappings to avoid repeated API calls
 */
type AsanaMappings = {
  workspaces: Map<string, string>; // name -> gid
  projects: Map<string, Map<string, string>>; // workspaceGid -> (name -> gid)
  customFields: Map<string, Map<string, TCustomFieldInfo>>; // workspaceGid -> (name -> info)
};

let mappingsCache: AsanaMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheToken = null;
};

/**
 * Asana API response types
 */
type TWorkspace = {
  gid: string;
  name: string;
};

type TProject = {
  gid: string;
  name: string;
};

type TCustomField = {
  gid: string;
  name: string;
  resource_subtype?: string;
  type?: string;
  enum_options?: Array<{ gid: string; name: string; enabled: boolean; color?: string }>;
};

/**
 * Initialize the mappings cache by fetching all workspaces and their projects
 */
const initializeMappingsCache = async (token: string): Promise<void> => {
  mappingsCache = {
    workspaces: new Map(),
    projects: new Map(),
    customFields: new Map(),
  };
  mappingsCacheToken = token;

  // Fetch all workspaces
  const workspacesResponse = await asanaClient.get<{ data: TWorkspace[] }>('workspaces', {
    token,
  });
  const workspaces = workspacesResponse?.data || [];

  for (const ws of workspaces) {
    mappingsCache.workspaces.set(ws.name, ws.gid);

    // Fetch projects for each workspace
    const projectsResponse = await asanaClient.get<{ data: TProject[] }>(
      `workspaces/${ws.gid}/projects`,
      { token }
    );
    const projects = projectsResponse?.data || [];

    const projectsMap = new Map<string, string>();
    for (const project of projects) {
      projectsMap.set(project.name, project.gid);
    }
    mappingsCache.projects.set(ws.gid, projectsMap);
  }
};

/**
 * Get project GID by parsing the hierarchical table path.
 * Also returns workspace GID for operations that need it.
 */
export const getAsanaProjectByPath = async (options: {
  token: string;
  tablePath: string;
}): Promise<{ projectGid: string; workspaceGid: string }> => {
  const { token, tablePath } = options;
  const { workspaceName, projectName } = parseTablePath(tablePath);

  // Refresh cache if token changed or not initialized
  if (!mappingsCache || mappingsCacheToken !== token) {
    await initializeMappingsCache(token);
  }

  // Resolve workspace
  const workspaceGid = mappingsCache!.workspaces.get(workspaceName);
  if (!workspaceGid) {
    throw new AsanaError(`Workspace "${workspaceName}" not found.`);
  }

  // Resolve project
  const projectsMap = mappingsCache!.projects.get(workspaceGid);
  const projectGid = projectsMap?.get(projectName);
  if (!projectGid) {
    throw new AsanaError(`Project "${projectName}" not found in workspace "${workspaceName}".`);
  }

  return { projectGid, workspaceGid };
};

/**
 * Get custom fields for a workspace (with caching)
 */
export const getAsanaCustomFields = async (options: {
  token: string;
  workspaceGid: string;
}): Promise<Map<string, TCustomFieldInfo>> => {
  const { token, workspaceGid } = options;

  // Ensure cache is initialized
  if (!mappingsCache || mappingsCacheToken !== token) {
    await initializeMappingsCache(token);
  }

  // Check if custom fields are already cached for this workspace
  if (mappingsCache!.customFields.has(workspaceGid)) {
    return mappingsCache!.customFields.get(workspaceGid)!;
  }

  // Fetch custom fields for this workspace
  const customFieldsMap = new Map<string, TCustomFieldInfo>();

  try {
    const response = await asanaClient.get<{ data: TCustomField[] }>(
      `workspaces/${workspaceGid}/custom_fields`,
      {
        token,
        params: {
          opt_fields:
            'gid,name,resource_subtype,type,enum_options,enum_options.gid,enum_options.name,enum_options.enabled,enum_options.color',
        },
      }
    );

    const fields = response?.data || [];
    for (const field of fields) {
      customFieldsMap.set(field.name, {
        gid: field.gid,
        name: field.name,
        type: field.resource_subtype || field.type || 'text',
        enumOptions: field.enum_options,
      });
    }
  } catch {
    // Custom fields might not be available, continue with empty map
  }

  // Cache the custom fields
  mappingsCache!.customFields.set(workspaceGid, customFieldsMap);

  return customFieldsMap;
};

/**
 * Maps Asana custom field types to Qore types
 */
export const mapAsanaFieldTypeToQore = (asanaType: string): TQoreType => {
  const typeMap: Record<string, TQoreType> = {
    text: 'string',
    enum: 'string',
    multi_enum: { type: 'list', element_type: 'string' },
    number: 'number',
    date: 'date',
    people: { type: 'list', element_type: 'string' },
    formula: 'any',
    custom_id: 'string',
  };

  return typeMap[asanaType] || 'any';
};

/**
 * Standard task fields that can be used in search filters
 */
export const STANDARD_FILTERABLE_FIELDS = [
  'completed',
  'assignee',
  'projects',
  'sections',
  'tags',
  'due_on',
  'due_at',
  'start_on',
  'start_at',
  'created_at',
  'modified_at',
] as const;

/**
 * Date fields that support before/after filtering
 */
export const DATE_FILTER_FIELDS = [
  'due_on',
  'due_at',
  'start_on',
  'start_at',
  'created_at',
  'modified_at',
  'completed_at',
] as const;
