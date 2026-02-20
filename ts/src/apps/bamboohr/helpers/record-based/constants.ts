/**
 * BambooHR Record-Based Constants
 *
 * Provides utilities for record-based operations on BambooHR employees.
 * BambooHR is a single-table system where the only "table" is Employees.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

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
  set: Record<string, unknown[] | unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(set)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
};
