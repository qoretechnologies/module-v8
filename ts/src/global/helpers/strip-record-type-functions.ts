// Copyright 2026 Qore Technologies, s.r.o.

import { IQoreTypeObjectNonList, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

const FUNCTION_KEYS = ['get_allowed_values', 'get_element_allowed_values'] as const;

/**
 * Strips function references (get_allowed_values, get_element_allowed_values) from record type fields.
 * These function references cannot be serialized to YAML for IPC and must be removed
 * from get_record_type return values. Use this when get_record_type calls shared helpers
 * that embed function references in the returned fields.
 */
export const stripRecordTypeFunctions = (recordType: TQoreTypeObject): TQoreTypeObject => {
  // List types don't have fields — return as-is
  if (recordType.type === 'list' || !('fields' in recordType)) {
    return recordType;
  }

  if (!recordType.fields) {
    return recordType;
  }

  const strippedFields: IQoreTypeObjectNonList['fields'] = {};

  for (const [key, field] of Object.entries(recordType.fields)) {
    const strippedField = { ...field };

    for (const fnKey of FUNCTION_KEYS) {
      if (fnKey in strippedField) {
        delete (strippedField as Record<string, unknown>)[fnKey];
      }
    }

    strippedFields![key] = strippedField;
  }

  return {
    ...recordType,
    fields: strippedFields,
  };
};
