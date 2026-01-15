/**
 * Time Off Types Helper
 *
 * Fetches and caches time off types from BambooHR.
 * Used for allowed values in time off related actions.
 *
 * @see https://documentation.bamboohr.com/reference/time-off-get-time-off-types
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { bambooHRClient } from '../client';
import { IBambooHRConnectionOptions, IBambooHRTimeOffType } from '../types';

// Cache for time off types with 5-minute TTL
const timeOffTypesCache = new Map<string, { data: IBambooHRTimeOffType[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Clear the time off types cache. Useful for testing.
 */
export const clearTimeOffTypesCache = (): void => {
  timeOffTypesCache.clear();
};

/**
 * Get time off types from BambooHR.
 * Results are cached for 5 minutes.
 */
export const getTimeOffTypes = async (
  connectionOptions: IBambooHRConnectionOptions
): Promise<IBambooHRTimeOffType[]> => {
  const cacheKey = connectionOptions.company_domain;
  const cached = timeOffTypesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await bambooHRClient.get<{ timeOffTypes: IBambooHRTimeOffType[] }>('meta/time_off/types', {
    token: connectionOptions.api_key,
    connectionOptions: { company_domain: connectionOptions.company_domain },
  });

  const types = response?.timeOffTypes || [];

  timeOffTypesCache.set(cacheKey, {
    data: types,
    timestamp: Date.now(),
  });

  return types;
};

/**
 * Get time off types as allowed values for action options.
 */
export const getTimeOffTypesAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const connOpts = context?.conn_opts as IBambooHRConnectionOptions | undefined;

  if (!connOpts?.api_key || !connOpts?.company_domain) {
    return [];
  }

  try {
    const types = await getTimeOffTypes(connOpts);

    return types.map((type) => ({
      value: type.id,
      display_name: type.name,
    }));
  } catch {
    return [];
  }
};

/**
 * Get time off request statuses as allowed values.
 */
export const getTimeOffStatusAllowedValues = (): IQoreAllowedValue<string>[] => [
  { value: 'approved', display_name: 'Approved' },
  { value: 'denied', display_name: 'Denied' },
  { value: 'requested', display_name: 'Requested' },
  { value: 'canceled', display_name: 'Canceled' },
  { value: 'superceded', display_name: 'Superceded' },
];
