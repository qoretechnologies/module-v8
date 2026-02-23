/**
 * BambooHR Record-Based Constants
 *
 * Provides utilities for record-based operations on BambooHR employees.
 * BambooHR is a single-table system where the only "table" is Employees.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { normalizeName } from '../../../../global/helpers';
import { IBambooHRFieldMetadata } from '../../types';

/**
 * Custom error class for BambooHR record-based operations
 */
export class BambooHRRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BambooHRRecordError';
  }
}

/**
 * The single table name for BambooHR record-based operations
 */
export const EMPLOYEES_TABLE = 'Employees';

/**
 * Maximum page size for search results
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Normalize set values to a single record (for update operations).
 * Handles column-format input where values may be arrays.
 */
export const normalizeSetToSingleRecord = (
  set: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(set)) {
    result[key] = Array.isArray(value) ? value[0] : value;
  }

  return result;
};

/**
 * Build a map from normalized field names (snake_case) to original BambooHR aliases.
 * Used for converting user input back to API-compatible field names.
 *
 * Example: "first_name" → "firstName", "last_name" → "lastName"
 */
export const buildNormalizedToAliasMap = (
  fields: IBambooHRFieldMetadata[]
): Map<string, string> => {
  const map = new Map<string, string>();

  for (const field of fields) {
    if (!field.alias) {
      continue;
    }

    const normalizedName = normalizeName(field.alias);
    map.set(normalizedName, field.alias);
  }

  // 'id' stays as 'id'
  map.set('id', 'id');

  return map;
};

/**
 * Reverse-normalize a record's keys from snake_case back to original BambooHR aliases.
 * Applies the normalized-to-alias mapping to all keys in the record.
 */
export const denormalizeRecordKeys = (
  record: Record<string, unknown>,
  normalizedToAlias: Map<string, string>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    result[normalizedToAlias.get(key) || key] = value;
  }

  return result;
};
