/**
 * BambooHR List Field Options Helpers
 *
 * Fetches and caches list field options (dropdown values) from the BambooHR API.
 * These are used to populate allowed_values for list-type fields.
 *
 * @see https://documentation.bamboohr.com/reference/metadata-get-details-for-list-fields
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { bambooHRClient } from '../client';
import { BambooHRError } from '../constants';
import {
  IBambooHRConnectionOptions,
  IBambooHRListMetadata,
  IBambooHRListsResponse,
} from '../types';

/**
 * Simple in-memory cache for list options.
 * Cache key is company_domain, value is { lists, timestamp }.
 */
const listsCache = new Map<
  string,
  {
    lists: IBambooHRListMetadata[];
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
 * Fetch all list field options from BambooHR.
 * Results are cached for 5 minutes to reduce API calls.
 *
 * @param options - Connection options (api_key, company_domain)
 * @returns Array of list metadata with options
 */
export const getBambooHRLists = async (
  options: IBambooHRConnectionOptions
): Promise<IBambooHRListMetadata[]> => {
  const { api_key, company_domain } = options;

  if (!api_key || !company_domain) {
    throw new BambooHRError('API key and company domain are required');
  }

  // Check cache first
  const cacheKey = company_domain;
  const cached = listsCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.lists;
  }

  try {
    const response = await bambooHRClient.get<IBambooHRListsResponse>('meta/lists', {
      token: api_key,
      connectionOptions: { company_domain },
    });

    const lists = response?.lists || [];

    // Update cache
    listsCache.set(cacheKey, {
      lists,
      timestamp: Date.now(),
    });

    return lists;
  } catch (error) {
    throw new BambooHRError(`Failed to fetch BambooHR lists: ${error}`);
  }
};

/**
 * Get list options for a specific field by its ID.
 *
 * @param options - Connection options
 * @param fieldId - The field ID to get options for
 * @returns Array of list options or undefined if not found
 */
export const getListOptionsByFieldId = async (
  options: IBambooHRConnectionOptions,
  fieldId: number
): Promise<IBambooHRListMetadata | undefined> => {
  const lists = await getBambooHRLists(options);
  return lists.find((list) => list.fieldId === fieldId);
};

/**
 * Convert BambooHR list options to Qore allowed values format.
 * Filters out archived options.
 *
 * @param list - List metadata with options
 * @returns Array of Qore allowed values
 */
export const mapListOptionsToAllowedValues = (
  list: IBambooHRListMetadata
): IQoreAllowedValue<string>[] => {
  return list.options
    .filter((option) => option.archived !== 'yes')
    .map((option) => ({
      value: option.value,
      display_name: option.value,
    }));
};

/**
 * Build a map from field ID to Qore allowed values.
 * This is used by the dynamic type generator to populate allowed_values for list fields.
 *
 * @param options - Connection options
 * @returns Map of field ID -> allowed values array
 */
export const getFieldIdToAllowedValuesMap = async (
  options: IBambooHRConnectionOptions
): Promise<Map<number, IQoreAllowedValue<string>[]>> => {
  const lists = await getBambooHRLists(options);
  const map = new Map<number, IQoreAllowedValue<string>[]>();

  lists.forEach((list) => {
    const allowedValues = mapListOptionsToAllowedValues(list);
    if (allowedValues.length > 0) {
      map.set(list.fieldId, allowedValues);
    }
  });

  return map;
};

/**
 * Check if a list field supports multiple values.
 *
 * @param options - Connection options
 * @param fieldId - The field ID to check
 * @returns True if the field supports multiple values
 */
export const isMultipleSelectField = async (
  options: IBambooHRConnectionOptions,
  fieldId: number
): Promise<boolean> => {
  const list = await getListOptionsByFieldId(options, fieldId);
  return list?.multiple === 'yes';
};

/**
 * Clear the lists cache. Useful for testing.
 */
export const clearListsCache = (): void => {
  listsCache.clear();
};
