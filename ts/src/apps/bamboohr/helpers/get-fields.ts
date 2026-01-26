/**
 * BambooHR Field Metadata Helpers
 *
 * Fetches and caches field metadata from the BambooHR API.
 * Fields include both standard fields (with aliases like "firstName")
 * and custom fields (with numeric IDs only).
 *
 * @see https://documentation.bamboohr.com/reference/metadata-get-a-list-of-fields
 */

import { bambooHRClient } from '../client';
import { BambooHRError } from '../constants';
import { IBambooHRConnectionOptions, IBambooHRFieldMetadata } from '../types';

/**
 * Simple in-memory cache for field metadata.
 * Cache key is company_domain, value is { fields, timestamp }.
 */
const fieldsCache = new Map<
  string,
  {
    fields: IBambooHRFieldMetadata[];
    timestamp: number;
  }
>();

/** Cache duration: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Check if cache entry is still valid.
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL_MS;
};

/**
 * Fetch all available fields from BambooHR.
 * Results are cached for 5 minutes to reduce API calls.
 *
 * @param options - Connection options (token, company_domain)
 * @returns Array of field metadata
 */
export const getBambooHRFields = async (
  options: IBambooHRConnectionOptions
): Promise<IBambooHRFieldMetadata[]> => {
  const { token, company_domain } = options;

  if (!token || !company_domain) {
    throw new BambooHRError('API key and company domain are required');
  }

  // Check cache first
  const cacheKey = company_domain;
  const cached = fieldsCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.fields;
  }

  try {
    const fields = await bambooHRClient.get<IBambooHRFieldMetadata[]>('meta/fields', {
      token: token,
      connectionOptions: { company_domain },
    });

    // Update cache
    fieldsCache.set(cacheKey, {
      fields,
      timestamp: Date.now(),
    });

    return fields;
  } catch (error) {
    throw new BambooHRError(`Failed to fetch BambooHR fields: ${error}`);
  }
};

/**
 * Get a field by its alias or ID.
 *
 * @param options - Connection options
 * @param aliasOrId - Field alias (e.g., "firstName") or numeric ID
 * @returns Field metadata or undefined if not found
 */
export const getFieldByAliasOrId = async (
  options: IBambooHRConnectionOptions,
  aliasOrId: string | number
): Promise<IBambooHRFieldMetadata | undefined> => {
  const fields = await getBambooHRFields(options);

  return fields.find((field) => {
    if (typeof aliasOrId === 'number') {
      return field.id === aliasOrId;
    }
    return field.alias === aliasOrId || field.id.toString() === aliasOrId;
  });
};

/**
 * Build a map from field display name to API key (alias or ID).
 * Used for transforming user input to API format.
 *
 * @param options - Connection options
 * @returns Map of display name -> API key
 */
export const getFieldNameToApiKeyMap = async (
  options: IBambooHRConnectionOptions
): Promise<Map<string, string>> => {
  const fields = await getBambooHRFields(options);
  const map = new Map<string, string>();

  fields.forEach((field) => {
    // Use alias if available, otherwise use ID
    const apiKey = field.alias || field.id.toString();
    map.set(field.name, apiKey);
  });

  return map;
};

/**
 * Build a map from API key (alias or ID) to field display name.
 * Used for transforming API response to user-friendly format.
 *
 * @param options - Connection options
 * @returns Map of API key -> display name
 */
export const getApiKeyToFieldNameMap = async (
  options: IBambooHRConnectionOptions
): Promise<Map<string, string>> => {
  const fields = await getBambooHRFields(options);
  const map = new Map<string, string>();

  fields.forEach((field) => {
    // Map both alias and ID to the display name
    if (field.alias) {
      map.set(field.alias, field.name);
    }
    map.set(field.id.toString(), field.name);
  });

  return map;
};

/**
 * Get all field aliases as a comma-separated string.
 * Useful for requesting all fields in a GET /employees/{id} call.
 *
 * Note: The GET employee endpoint only supports fields with aliases (standard fields).
 * Custom fields (those with only numeric IDs) return a 404 "Unsupported Table field"
 * error when accessed via the GET employee endpoint. Custom fields can only be
 * retrieved via the custom reports API.
 *
 * @param options - Connection options
 * @param maxFields - Maximum number of fields to include (BambooHR has 400 field limit)
 * @returns Comma-separated string of field aliases
 */
export const getAllFieldsString = async (
  options: IBambooHRConnectionOptions,
  maxFields = 400
): Promise<string> => {
  const fields = await getBambooHRFields(options);

  // Only include fields with aliases - numeric IDs cause 404 errors
  // on the GET employee endpoint
  return fields
    .filter((field) => field.alias)
    .slice(0, maxFields)
    .map((field) => field.alias)
    .join(',');
};

/**
 * Clear the fields cache. Useful for testing.
 */
export const clearFieldsCache = (): void => {
  fieldsCache.clear();
};
