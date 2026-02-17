/**
 * NetSuite Record-Based Helpers Constants
 *
 * Shared utilities for NetSuite record-based operations including SQL escaping,
 * type inference, field caching, and REST API request helpers.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest, TQoreType } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { delay } from '../../../../global/helpers';
import { fetchSuiteQlData } from '../constants';

/**
 * Custom error class for NetSuite record-based operations
 */
export class NetsuiteRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetsuiteRecordError';
  }
}

/**
 * Maximum page size for SuiteQL queries
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Delay between sequential REST operations to respect rate limits
 */
export const REST_OPERATION_DELAY = 300;

/**
 * ISO 8601 date patterns for type inference
 */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
const US_DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{4}/;

/**
 * Escape a SQL value to prevent injection.
 * Strings are single-quoted with internal quotes doubled.
 * Numbers pass through as-is. Null becomes literal NULL.
 * Booleans use NetSuite convention: 'T' or 'F'.
 */
export const escapeSqlValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new NetsuiteRecordError(`Invalid numeric value: ${value}`);
    }
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? "'T'" : "'F'";
  }

  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
};

/**
 * Validate and escape a SQL identifier (field or table name).
 * Only allows alphanumeric, underscores, and dots.
 */
export const escapeSqlIdentifier = (identifier: string): string => {
  if (!identifier || !/^[a-zA-Z0-9_.]+$/.test(identifier)) {
    throw new NetsuiteRecordError(
      `Invalid SQL identifier: "${identifier}". Only alphanumeric characters, underscores, and dots are allowed.`
    );
  }
  return identifier;
};

/**
 * Infer a Qore type from a SuiteQL value.
 * Used to build dynamic schemas from query results.
 */
export const inferQoreTypeFromValue = (value: unknown): TQoreType => {
  if (value === null || value === undefined) {
    return 'string';
  }

  if (typeof value === 'boolean') {
    return 'bool';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    if (ISO_DATE_REGEX.test(value) || US_DATE_REGEX.test(value)) {
      return 'date';
    }
    return 'string';
  }

  if (Array.isArray(value)) {
    return { type: 'list', element_type: 'any' };
  }

  if (typeof value === 'object') {
    return 'any';
  }

  return 'string';
};

/**
 * Cache for record type field schemas to avoid repeated queries
 */
type TFieldCacheEntry = Map<string, TQoreType>;
const fieldCache = new Map<string, TFieldCacheEntry>();
let fieldCacheToken: string | null = null;

/**
 * Clear the field cache (useful for testing)
 */
export const clearFieldCache = (): void => {
  fieldCache.clear();
  fieldCacheToken = null;
};

/**
 * Fetch record field names and types via SuiteQL `SELECT * FROM {type} LIMIT 1`.
 * Results are cached per account + record type combination.
 */
export const getRecordFieldsViaQuery = async (options: {
  token: string;
  accountId: string;
  recordType: string;
}): Promise<Map<string, TQoreType>> => {
  const { token, accountId, recordType } = options;

  // Invalidate cache if token changed
  if (fieldCacheToken !== token) {
    fieldCache.clear();
    fieldCacheToken = token;
  }

  const cacheKey = `${accountId}:${recordType}`;
  if (fieldCache.has(cacheKey)) {
    return fieldCache.get(cacheKey)!;
  }

  const fieldsMap = new Map<string, TQoreType>();

  try {
    const safeRecordType = escapeSqlIdentifier(recordType);
    const result = await fetchSuiteQlData({
      accountId,
      token,
      q: `SELECT * FROM ${safeRecordType}`,
      limit: 1,
    });

    if (result.items.length > 0) {
      const record = result.items[0] as Record<string, unknown>;
      for (const [fieldName, fieldValue] of Object.entries(record)) {
        fieldsMap.set(fieldName, inferQoreTypeFromValue(fieldValue));
      }
    } else {
      fieldsMap.set('id', 'string');
    }
  } catch (error) {
    Debugger.log(`Failed to fetch fields for ${recordType}: ${error}`);
    fieldsMap.set('id', 'string');
  }

  fieldCache.set(cacheKey, fieldsMap);
  return fieldsMap;
};

/**
 * Make a REST API request to the NetSuite record API.
 * Handles the common URL pattern: /services/rest/record/v1/{recordType}/{recordId}
 */
export const netsuiteRecordRequest = async <T = unknown>(options: {
  token: string;
  accountId: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  recordType: string;
  recordId?: string;
  data?: Record<string, unknown>;
}): Promise<{ data: T; headers: Record<string, string> }> => {
  const { token, accountId, method, recordType, recordId, data } = options;
  const baseUrl = `https://${accountId}.suitetalk.api.netsuite.com`;
  const path = `/services/rest/record/v1/${recordType}${recordId ? `/${recordId}` : ''}`;

  const requestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    path,
    ...(data ? { data } : {}),
  };

  const endpointConfig = { endpointId: 'NetSuite', url: baseUrl };

  let response: any;

  switch (method) {
    case 'GET':
      response = await QorusRequest.get<any>(requestConfig, endpointConfig);
      break;
    case 'POST':
      response = await QorusRequest.post<any>(requestConfig, endpointConfig);
      break;
    case 'PATCH':
      response = await QorusRequest.patch<any>(requestConfig, endpointConfig);
      break;
    case 'DELETE':
      response = await QorusRequest.deleteReq<any>(requestConfig, endpointConfig);
      break;
  }

  return {
    data: response?.data as T,
    headers: response?.headers || {},
  };
};

/**
 * Normalize `set` parameter into a single flat object of fields to update.
 * Handles both column format ({ field: [val] }) and plain object format ({ field: val }).
 */
export const normalizeSetToSingleRecord = (
  input: unknown,
  mapColumnFormatToObjectFn: (data: Record<string, unknown>) => Record<string, unknown>[]
): Record<string, unknown> => {
  if (Array.isArray(input)) {
    return (input[0] as Record<string, unknown>) || {};
  }

  if (input && typeof input === 'object') {
    const values = Object.values(input);
    const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
    const lengths = allArrays ? values.map((v) => (v as unknown[]).length) : [];
    const sameLength = lengths.length > 0 && new Set(lengths).size === 1;

    if (allArrays && sameLength) {
      const records = mapColumnFormatToObjectFn(input as Record<string, unknown>);
      return records[0] || {};
    }

    return input as Record<string, unknown>;
  }

  return {};
};

/**
 * Find matching record IDs via SuiteQL query with pagination.
 * Used by update and delete operations.
 */
export const findMatchingRecordIds = async (options: {
  token: string;
  accountId: string;
  recordType: string;
  whereClause: string;
}): Promise<string[]> => {
  const { token, accountId, recordType, whereClause } = options;
  const safeRecordType = escapeSqlIdentifier(recordType);
  const query = `SELECT id FROM ${safeRecordType}${whereClause ? ` WHERE ${whereClause}` : ''}`;

  const matchingIds: string[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchSuiteQlData({
      accountId,
      token,
      q: query,
      limit: MAX_PAGE_SIZE,
      offset,
    });

    for (const item of result.items as Record<string, unknown>[]) {
      matchingIds.push(String(item.id));
    }

    hasMore = result.hasMore;
    offset += result.items.length;

    if (hasMore) {
      await delay(REST_OPERATION_DELAY);
    }
  }

  return matchingIds;
};
