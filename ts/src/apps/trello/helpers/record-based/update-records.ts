/**
 * Trello Update Records
 *
 * Updates existing Trello cards (records) that match WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { trelloClient } from '../../client';
import { filterRecords } from './apply-where-condition';
import {
  getCustomFieldsForBoard,
  getIdsFromTablePath,
  normalizeSetToSingleRecord,
  transformCardToRecord,
  transformRecordToCardPayload,
  TrelloCard,
  TrelloRecordError,
} from './constants';

/**
 * Update cards matching WHERE conditions.
 * Returns the count of updated records.
 */
export const updateTrelloRecords: TQoreUpdateRecordsFunction = async (ctx, set, where, opts) => {
  const { token, key } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'key'],
    ErrorClass: TrelloRecordError,
  });

  const tablePath = opts?.table;

  if (!tablePath) {
    throw new TrelloRecordError('Table path is required in opts.table');
  }

  try {
    // Parse table path to get board and list IDs
    const { boardId, listId } = await getIdsFromTablePath(tablePath, token, key);

    // Get custom field definitions
    const customFieldDefs = await getCustomFieldsForBoard({ token, key, boardId });

    // Fetch all cards from the list
    const cards = await trelloClient.get<TrelloCard[]>(`lists/${listId}/cards`, {
      token,
      key,
      params: {
        customFieldItems: 'true',
        fields: 'id,name,desc,closed,due,dueComplete,start,pos,idList,idBoard,idMembers,idLabels,shortUrl,url,dateLastActivity',
      },
    });

    // Transform to records and apply WHERE filter
    const records = cards.map((card) => transformCardToRecord(card, customFieldDefs));
    const matchingRecords = filterRecords(records, where);

    if (matchingRecords.length === 0) {
      return 0;
    }

    // Normalize set values (convert from column format if needed)
    const setValues = Array.isArray(Object.values(set)[0])
      ? normalizeSetToSingleRecord(set)
      : set;

    // Get card and custom field updates
    const { cardPayload, customFieldUpdates } = transformRecordToCardPayload(
      setValues as Record<string, unknown>,
      customFieldDefs
    );

    // Update each matching card
    for (const record of matchingRecords) {
      const cardId = record.id as string;

      // Update standard card fields
      if (Object.keys(cardPayload).length > 0) {
        const updateParams: Record<string, string> = {};

        for (const [field, value] of Object.entries(cardPayload)) {
          if (Array.isArray(value)) {
            updateParams[field] = value.join(',');
          } else if (value !== undefined && value !== null) {
            updateParams[field] = String(value);
          }
        }

        if (Object.keys(updateParams).length > 0) {
          await trelloClient.put(`cards/${cardId}`, undefined, {
            token,
            key,
            params: updateParams,
          });
        }
      }

      // Update custom field values
      for (const cfUpdate of customFieldUpdates) {
        await trelloClient.put(
          `cards/${cardId}/customField/${cfUpdate.fieldId}/item`,
          typeof cfUpdate.value === 'string'
            ? { idValue: cfUpdate.value }
            : { value: cfUpdate.value },
          { token, key }
        );
      }
    }

    return matchingRecords.length;
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to update records: ${error}`);
  }
};
