/**
 * Short-TTL in-memory cache for Slack allowed-values lookups.
 *
 * Resolving allowed_values for the channel / user pickers enumerates the entire
 * workspace via conversations.list / users.list, which is slow (10-20s for large
 * workspaces) and aggressively rate-limited by Slack. The IDE issues a rapid burst
 * of getOptions calls while an action form mounts, and the workspace's channel /
 * user set is stable across that window, so caching the resolved list per
 * connection for a short period collapses the burst into a single Slack round-trip.
 *
 * Keyed by (kind, token): the token identifies the connection / workspace, and the
 * kind separates the distinct lookups (active channels, archived channels, users).
 * Only successful lookups are cached; a failed fetch propagates and caches nothing.
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

/** Cache duration: 60 seconds */
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  values: IQoreAllowedValue<string>[];
  timestamp: number;
}

/**
 * Per-connection allowed-values cache. The token is held only in memory (it is
 * already present in the connection options) and is never logged or serialized.
 */
const cache = new Map<string, CacheEntry>();

/**
 * Check if a cache entry is still within the TTL window.
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL_MS;
};

/**
 * Return the cached allowed-values for (kind, token), or resolve them via
 * \a fetcher and cache the result for a short window.
 *
 * @param kind discriminator for the lookup type (e.g. 'channels', 'archived-channels', 'users')
 * @param token the Slack connection token identifying the workspace
 * @param fetcher resolves the allowed-values list on a cache miss
 * @returns the resolved allowed-values list
 */
export const getCachedAllowedValues = async (
  kind: string,
  token: string,
  fetcher: () => Promise<IQoreAllowedValue<string>[]>
): Promise<IQoreAllowedValue<string>[]> => {
  const cacheKey = `${kind}:${token}`;
  const cached = cache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.values;
  }

  const values = await fetcher();
  cache.set(cacheKey, { values, timestamp: Date.now() });
  return values;
};

/**
 * Clear the allowed-values cache. Useful for testing.
 */
export const clearSlackAllowedValuesCache = (): void => {
  cache.clear();
};
