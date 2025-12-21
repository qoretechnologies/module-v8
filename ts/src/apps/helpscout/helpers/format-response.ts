import { omit } from 'lodash';

type THelpScoutResponseObject = Record<string, any>;

/**
 * Formats a HelpScout API response by:
 * 1. Removing `_links` field
 * 2. Spreading `_embedded` fields to the top level
 *
 * Works with both single objects and arrays of objects.
 */
export function formatHelpScoutResponse<T extends THelpScoutResponseObject>(data: T): T;
export function formatHelpScoutResponse<T extends THelpScoutResponseObject>(data: T[]): T[];
export function formatHelpScoutResponse<T extends THelpScoutResponseObject>(
  data: T | T[]
): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => formatSingleObject(item));
  }

  return formatSingleObject(data);
}

function formatSingleObject<T extends THelpScoutResponseObject>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const { _embedded, ...rest } = omit(obj, ['_links']) as T & { _embedded?: Record<string, any> };

  if (_embedded && typeof _embedded === 'object') {
    return {
      ...rest,
      ..._embedded,
    } as T;
  }

  return rest as T;
}
