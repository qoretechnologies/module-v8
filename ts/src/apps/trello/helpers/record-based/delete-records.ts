/**
 * Trello Delete Records
 *
 * Deletes Trello cards (records) that match WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { trelloClient } from '../../client';
import { filterRecords } from './apply-where-condition';
import {
  getCustomFieldsForBoard,
  getIdsFromTablePath,
  transformCardToRecord,
  TrelloCard,
  TrelloRecordError,
} from './constants';

/**
 * Delete cards matching WHERE conditions.
 * Returns the count of deleted records.
 */
export const deleteTrelloRecords: TQoreDeleteRecordsFunction = async (ctx, where, opts) => {
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

    // Get custom field definitions (needed for record transformation)
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

    // Delete each matching card
    for (const record of matchingRecords) {
      const cardId = record.id as string;
      await trelloClient.delete(`cards/${cardId}`, { token, key });
    }

    return matchingRecords.length;
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to delete records: ${error}`);
  }
};
