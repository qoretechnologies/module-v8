/**
 * Trello Search Records
 *
 * Implements iterator-based search for Trello cards with filtering and pagination.
 * Cards are the "records" in the Trello record-based context.
 *
 * Since Trello API lacks server-side filtering, filtering is done client-side.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { trelloClient } from '../../client';
import { filterRecords, sortRecords } from './apply-where-condition';
import {
  getCustomFieldsForBoard,
  getIdsFromTablePath,
  MAX_PAGE_SIZE,
  transformCardToRecord,
  TrelloCard,
  TrelloRecordError,
} from './constants';

/**
 * Search for Trello cards (records) with filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchTrelloRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token, key } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'key'],
    ErrorClass: TrelloRecordError,
  });

  const tablePath = opts?.table;
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!tablePath) {
    throw new TrelloRecordError('Table path is required in opts.table');
  }

  try {
    // Parse table path to get board and list IDs
    const { boardId, listId } = await getIdsFromTablePath(tablePath, token, key);

    // Get custom field definitions for the board
    const customFieldDefs = await getCustomFieldsForBoard({ token, key, boardId });

    // Fetch all cards from the list (Trello doesn't support pagination for cards)
    const cards = await trelloClient.get<TrelloCard[]>(`lists/${listId}/cards`, {
      token,
      key,
      params: {
        customFieldItems: 'true',
        fields: 'id,name,desc,closed,due,dueComplete,start,pos,idList,idBoard,idMembers,idLabels,shortUrl,url,dateLastActivity',
      },
    });

    // Transform cards to flat records
    let records = cards.map((card) => transformCardToRecord(card, customFieldDefs));

    // Apply client-side WHERE filtering
    records = filterRecords(records, where);

    // Apply sorting
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
    records = sortRecords(records, orderBy);

    // Create iterator state
    let offset = 0;
    let hasMore = records.length > 0;

    /**
     * Iterator function that returns batches of records
     */
    const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      const pageSize = Math.min(blockSize || limit, limit);
      const endIndex = Math.min(offset + pageSize, records.length);
      const batch = records.slice(offset, endIndex);

      if (batch.length === 0) {
        hasMore = false;
        return null;
      }

      offset = endIndex;
      hasMore = offset < records.length;

      // Return records in column format
      return mapObjectToColumnFormat(batch);
    };

    return getRecords;
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to search records: ${error}`);
  }
};
