/**
 * SharePoint Record-Based Helpers Constants
 *
 * This module provides utilities for working with SharePoint's hierarchical structure
 * in a record-based context where Lists are treated as "tables" and List Items as "records".
 *
 * SharePoint hierarchy: Site -> List -> List Item
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { ColumnDefinition } from '@microsoft/microsoft-graph-types';
import { IQoreTypeObjectNonList, TQoreAppActionOption, TQoreType } from '@qoretechnologies/ts-toolkit';

/**
 * Custom error class for SharePoint record-based operations
 */
export class SharePointRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SharePointRecordError';
  }
}

/**
 * Table path separator for hierarchical paths
 */
export const TABLE_PATH_SEPARATOR = '|';

/**
 * Parsed table path components
 */
export interface SharePointTablePath {
  siteName: string;
  listName: string;
}

/**
 * Site info stored in cache
 */
interface SiteInfo {
  id: string;
  name: string;
}

/**
 * List info stored in cache
 */
interface ListInfo {
  id: string;
  name: string;
}

/**
 * Cache structure for SharePoint name-to-ID mappings
 */
type SharePointMappings = {
  sites: Map<string, SiteInfo>; // displayName -> { id, name }
  lists: Map<string, Map<string, ListInfo>>; // siteId -> (displayName -> { id, name })
};

let mappingsCache: SharePointMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheToken = null;
};

/**
 * Create a Microsoft Graph client with the given token
 */
export const getSharePointGraphClient = (token: string): Client => {
  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });
};

/**
 * Initialize the mappings cache by fetching all sites and their lists
 */
const initializeMappingsCache = async (token: string): Promise<void> => {
  mappingsCache = {
    sites: new Map(),
    lists: new Map(),
  };
  mappingsCacheToken = token;

  const client = getSharePointGraphClient(token);

  // Fetch all sites
  let siteResponse = await client.api('/sites?search=*&$select=displayName,id').get();

  while (siteResponse.value.length > 0) {
    for (const site of siteResponse.value) {
      if (site.displayName && site.id) {
        mappingsCache.sites.set(site.displayName, { id: site.id, name: site.displayName });
      }
    }
    if (siteResponse['@odata.nextLink']) {
      siteResponse = await client.api(siteResponse['@odata.nextLink']).get();
    } else {
      break;
    }
  }

  // Fetch lists for each site
  for (const [, siteInfo] of mappingsCache.sites) {
    const listsMap = new Map<string, ListInfo>();

    let listResponse = await client
      .api(`/sites/${siteInfo.id}/lists?$select=displayName,id,system,list`)
      .get();

    while (listResponse.value.length > 0) {
      for (const list of listResponse.value) {
        // Skip system/hidden lists and document libraries
        if (list.system || list.list?.template === 'documentLibrary') {
          continue;
        }
        if (list.displayName && list.id) {
          listsMap.set(list.displayName, { id: list.id, name: list.displayName });
        }
      }
      if (listResponse['@odata.nextLink']) {
        listResponse = await client.api(listResponse['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    mappingsCache.lists.set(siteInfo.id, listsMap);
  }
};

/**
 * Parse a hierarchical table path into its components.
 * Format: "siteName|listName"
 */
export const parseTablePath = (tablePath: string): SharePointTablePath => {
  const parts = tablePath.split(TABLE_PATH_SEPARATOR);

  if (parts.length !== 2) {
    throw new SharePointRecordError(
      `Invalid table path format: "${tablePath}". Expected "siteName|listName".`
    );
  }

  return {
    siteName: parts[0],
    listName: parts[1],
  };
};

/**
 * Build a hierarchical table path from components
 */
export const buildTablePath = (siteName: string, listName: string): string => {
  return `${siteName}${TABLE_PATH_SEPARATOR}${listName}`;
};

/**
 * Resolve a table path to SharePoint site ID and list ID
 */
export const getSharePointSiteAndList = async (options: {
  token: string;
  tablePath: string;
}): Promise<{ siteId: string; listId: string }> => {
  const { token, tablePath } = options;
  const { siteName, listName } = parseTablePath(tablePath);

  // Refresh cache if token changed or not initialized
  if (!mappingsCache || mappingsCacheToken !== token) {
    await initializeMappingsCache(token);
  }

  // Resolve site
  const siteInfo = mappingsCache!.sites.get(siteName);
  if (!siteInfo) {
    throw new SharePointRecordError(`Site "${siteName}" not found.`);
  }

  // Resolve list
  const listsMap = mappingsCache!.lists.get(siteInfo.id);
  const listInfo = listsMap?.get(listName);
  if (!listInfo) {
    throw new SharePointRecordError(`List "${listName}" not found in site "${siteName}".`);
  }

  return { siteId: siteInfo.id, listId: listInfo.id };
};

/**
 * Map a SharePoint column definition to a Qore type
 */
export const mapSharePointColumnTypeToQore = (
  column: ColumnDefinition
): { type: TQoreType; allowed_values?: Array<{ display_name: string; value: string }> } | null => {
  if (column.boolean) {
    return { type: 'bool' };
  }
  if (column.text) {
    return { type: 'string' };
  }
  if (column.dateTime) {
    return { type: 'date' };
  }
  if (column.choice) {
    if (column.choice.displayAs === 'checkBoxes') {
      return {
        type: { type: 'list', element_type: 'string' },
        allowed_values: column.choice.choices?.map((c) => ({ display_name: c, value: c })),
      };
    }
    return {
      type: 'string',
      allowed_values: column.choice.choices?.map((c) => ({ display_name: c, value: c })),
    };
  }
  if (column.number) {
    return { type: 'number' };
  }
  if (column.currency) {
    return { type: 'number' };
  }
  if (column.lookup) {
    return { type: 'string' };
  }
  if (column.personOrGroup) {
    return { type: 'string' };
  }
  if (column.hyperlinkOrPicture) {
    return { type: 'string' };
  }
  // Skip unsupported column types (calculated, thumbnail, geolocation, etc.)
  return null;
};

/**
 * Map a single writable ColumnDefinition to a TQoreAppActionOption entry.
 * Returns null if the column is read-only, unnamed, or has an unsupported type.
 */
const mapColumnToField = (
  column: ColumnDefinition
): { name: string; field: TQoreAppActionOption } | null => {
  if (column.readOnly || !column.name) {
    return null;
  }

  const mapped = mapSharePointColumnTypeToQore(column);
  if (!mapped) {
    return null;
  }

  return {
    name: column.name,
    field: {
      display_name: column.displayName || column.name,
      short_desc: column.description || '',
      required: false,
      type: mapped.type as TQoreAppActionOption['type'],
      ...(mapped.allowed_values?.length ? { allowed_values: mapped.allowed_values } : {}),
    } as TQoreAppActionOption,
  };
};

/**
 * Get the Qore type object fields for a SharePoint list's columns.
 * Used by get-record-type to build the dynamic schema.
 */
export const getSharePointColumnFields = async (options: {
  token: string;
  siteId: string;
  listId: string;
}): Promise<IQoreTypeObjectNonList['fields']> => {
  const { token, siteId, listId } = options;
  const client = getSharePointGraphClient(token);
  const fields: NonNullable<IQoreTypeObjectNonList['fields']> = {};

  let response = await client.api(`/sites/${siteId}/lists/${listId}/columns`).get();

  while (response.value.length > 0) {
    for (const column of response.value as ColumnDefinition[]) {
      const result = mapColumnToField(column);
      if (result) {
        fields[result.name] = result.field;
      }
    }
    if (response['@odata.nextLink']) {
      response = await client.api(response['@odata.nextLink']).get();
    } else {
      break;
    }
  }

  return fields;
};

/**
 * SharePoint list item from API response
 */
export type TSharePointListItem = {
  id: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  webUrl?: string;
  eTag?: string;
  fields?: Record<string, unknown>;
};

/**
 * Transform a SharePoint list item API response to a flat record format
 */
export const transformItemToRecord = (item: TSharePointListItem): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: item.id,
    createdDateTime: item.createdDateTime || null,
    lastModifiedDateTime: item.lastModifiedDateTime || null,
    webUrl: item.webUrl || null,
  };

  // Flatten all fields from the fields object
  if (item.fields) {
    for (const [key, value] of Object.entries(item.fields)) {
      // Skip internal OData fields
      if (key.startsWith('@odata') || key.startsWith('_')) {
        continue;
      }
      record[key] = value ?? null;
    }
  }

  return record;
};

/**
 * Normalize set values to a single flat record (for update operations).
 * Handles both column format ({ field: [val1, val2] }) and plain object format ({ field: val }).
 */
export const normalizeSetToSingleRecord = (
  input: unknown,
  mapColumnFormatToObject: (data: Record<string, unknown>) => Record<string, unknown>[]
): Record<string, unknown> => {
  // Case 1: array of records
  if (Array.isArray(input)) {
    if (input.length > 1) {
      throw new SharePointRecordError(
        `SharePoint update supports a single record in 'set'; received ${input.length} records.`
      );
    }
    return (input[0] as Record<string, unknown>) || {};
  }

  // Case 2: object - could be column format or a flat object
  if (input && typeof input === 'object') {
    const values = Object.values(input);

    // Check if this looks like column format (all values are arrays of same length)
    const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
    const lengths = allArrays ? values.map((v) => (v as unknown[]).length) : [];
    const sameLength = lengths.length > 0 && new Set(lengths).size === 1;

    if (allArrays && sameLength) {
      const records = mapColumnFormatToObject(input as Record<string, unknown>);
      if (records.length > 1) {
        throw new SharePointRecordError(
          `SharePoint update supports a single record in 'set'; received ${records.length} records.`
        );
      }
      return records[0] || {};
    }

    // Assume plain flat object of fields to update
    return input as Record<string, unknown>;
  }

  return {};
};
