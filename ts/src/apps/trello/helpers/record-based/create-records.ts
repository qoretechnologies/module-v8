/**
 * Trello Create Records
 *
 * Creates new Trello cards (records) in a specific Board|List.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { trelloClient } from '../../client';
import {
  getCustomFieldsForBoard,
  getIdsFromTablePath,
  transformCardToRecord,
  transformRecordToCardPayload,
  TrelloCard,
  TrelloRecordError,
} from './constants';

/**
 * Create new cards in a Trello list.
 * Accepts records in column format and returns created records in column format.
 */
export const createTrelloRecords: TQoreCreateRecordsFunction = async (ctx, records, opts) => {
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

    // Convert column format to array of records
    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Create cards sequentially (Trello doesn't support batch create)
    for (const record of recordsArray) {
      const { cardPayload, customFieldUpdates } = transformRecordToCardPayload(
        record,
        customFieldDefs
      );

      // Build card params
      const cardParams: Record<string, string> = {
        idList: listId,
        name: (cardPayload.name as string) || 'Untitled Card',
      };

      if (cardPayload.desc) {
        cardParams.desc = cardPayload.desc as string;
      }
      if (cardPayload.due) {
        cardParams.due = cardPayload.due as string;
      }
      if (cardPayload.start) {
        cardParams.start = cardPayload.start as string;
      }
      if (cardPayload.pos) {
        cardParams.pos = String(cardPayload.pos);
      }
      if (cardPayload.idMembers) {
        cardParams.idMembers = (cardPayload.idMembers as string[]).join(',');
      }
      if (cardPayload.idLabels) {
        cardParams.idLabels = (cardPayload.idLabels as string[]).join(',');
      }

      // Create the card
      const createdCard = await trelloClient.post<TrelloCard>('cards', undefined, {
        token,
        key,
        params: cardParams,
      });

      // Set custom field values
      for (const cfUpdate of customFieldUpdates) {
        await trelloClient.put(
          `cards/${createdCard.id}/customField/${cfUpdate.fieldId}/item`,
          typeof cfUpdate.value === 'string'
            ? { idValue: cfUpdate.value }
            : { value: cfUpdate.value },
          { token, key }
        );
      }

      // Fetch the complete card with custom fields
      const completeCard = await trelloClient.get<TrelloCard>(`cards/${createdCard.id}`, {
        token,
        key,
        params: { customFieldItems: 'true' },
      });

      createdRecords.push(transformCardToRecord(completeCard, customFieldDefs));
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to create records: ${error}`);
  }
};
