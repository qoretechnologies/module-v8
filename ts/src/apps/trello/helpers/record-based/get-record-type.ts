/**
 * Trello Get Record Type
 *
 * Returns the dynamic schema (record type) for cards in a specific Board|List,
 * including both standard card fields and custom fields defined on the board.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  IQoreTypeObjectNonList,
  TQoreAppActionOption,
  TQoreGetRecordTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  CUSTOM_FIELD_PREFIX,
  getCustomFieldsForBoard,
  getIdsFromTablePath,
  mapTrelloFieldTypeToQore,
  STANDARD_CARD_FIELDS,
  TrelloRecordError,
} from './constants';

/**
 * Get the record type (schema) for cards in a specific Board|List table.
 * Includes standard card fields plus dynamic custom fields.
 */
export const getTrelloRecordType: TQoreGetRecordTypeFunction = async (ctx, tablePath) => {
  const { token, key } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'key'],
    ErrorClass: TrelloRecordError,
  });

  try {
    // Get board ID from table path
    const { boardId } = await getIdsFromTablePath(tablePath, token, key);

    // Build base fields from standard card fields
    const fields: Record<string, TQoreAppActionOption> = {};

    for (const [fieldName, fieldType] of Object.entries(STANDARD_CARD_FIELDS)) {
      fields[fieldName] = { type: fieldType } as TQoreAppActionOption;
    }

    // Get custom fields for the board
    const customFields = await getCustomFieldsForBoard({
      token,
      key,
      boardId,
    });

    // Add custom fields with cf_ prefix
    for (const [fieldName, fieldDef] of customFields) {
      const qoreType = mapTrelloFieldTypeToQore(fieldDef.type);
      const customFieldKey = `${CUSTOM_FIELD_PREFIX}${fieldName}`;

      const fieldOption: TQoreAppActionOption = { type: qoreType } as TQoreAppActionOption;

      // Add allowed values for list-type custom fields
      if (fieldDef.type === 'list' && fieldDef.options) {
        (fieldOption as any).allowed_values = fieldDef.options.map((opt) => ({
          value: opt.value.text,
          display_name: opt.value.text,
        }));
      }

      fields[customFieldKey] = fieldOption;
    }

    return {
      type: 'hash',
      fields,
    } as IQoreTypeObjectNonList;
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to get record type: ${error}`);
  }
};
