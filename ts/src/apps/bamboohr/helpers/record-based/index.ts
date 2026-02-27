/**
 * BambooHR Record-Based Helpers
 *
 * Exports all record-based helper functions for the BambooHR app.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

export {
  BambooHRRecordError,
  EMPLOYEES_TABLE,
  MAX_PAGE_SIZE,
  normalizeSetToSingleRecord,
  buildNormalizedToAliasMap,
  denormalizeRecordKeys,
} from './constants';
export { filterRecords, sortRecords } from './apply-where-condition';
export { createBambooHRRecords } from './create-records';
export { getBambooHRExpressions } from './get-expressions';
export { getBambooHRRecordType } from './get-record-type';
export { BambooHRSearchOptions } from './get-search-options';
export { getBambooHRTableList } from './get-table-list';
export { searchBambooHRRecords } from './search-records';
export { updateBambooHRRecords } from './update-records';
