/**
 * QuickBooks Get Record Type
 *
 * Returns the dynamic field schema for a specific entity type.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { ENTITY_FIELD_DEFINITIONS, validateEntityType } from './constants';

/**
 * Get the record type (schema) for a specific QuickBooks entity type.
 * Schemas are static — no API calls needed.
 */
export const getQuickbooksRecordType: TQoreGetRecordTypeFunction = async (_context, tableName) => {
  const entityType = validateEntityType(tableName);
  const fields = ENTITY_FIELD_DEFINITIONS[entityType];

  return {
    type: 'hash',
    fields,
  } as IQoreTypeObjectNonList;
};
