/**
 * Mailchimp Record-Based Helpers
 *
 * Exports all record-based helper functions for the Mailchimp app.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

export {
  clearMappingsCache,
  CUSTOM_FIELD_PREFIX,
  getListIdByName,
  getMailchimpLists,
  getMergeFieldsForList,
  getSubscriberHash,
  MailchimpError,
  normalizeSetToSingleRecord,
  transformMemberToRecord,
  transformRecordToMemberPayload,
} from './constants';
export type { TMailchimpMember, TMailchimpMergeField } from './constants';
export { getMailchimpTableList } from './get-table-list';
export { getMailchimpRecordType } from './get-record-type';
export { getMailchimpExpressions } from './get-expressions';
export { MailchimpSearchOptions } from './get-search-options';
export {
  extractServerFilters,
  filterRecords,
  serverFiltersToParams,
  sortRecords,
} from './apply-where-condition';
export { searchMailchimpRecords } from './search-records';
export { createMailchimpRecords } from './create-records';
export { updateMailchimpRecords } from './update-records';
export { deleteMailchimpRecords } from './delete-records';
export { upsertMailchimpRecords } from './upsert-records';
