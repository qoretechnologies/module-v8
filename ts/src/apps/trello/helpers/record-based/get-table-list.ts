/**
 * Trello Get Table List
 *
 * Returns all available Board|List combinations as table paths
 * in the format "boardName|listName".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { trelloClient } from '../../client';
import {
  buildTablePath,
  TrelloBoard,
  TrelloList,
  TrelloRecordError,
} from './constants';

/**
 * Get all available tables (Board|List combinations).
 * Returns table names in the format: "boardName|listName"
 */
export const getTrelloTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token, key } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'key'],
    ErrorClass: TrelloRecordError,
  });

  try {
    const tables: string[] = [];

    // Fetch all open boards
    const boards = await trelloClient.get<TrelloBoard[]>('members/me/boards', {
      token,
      key,
      params: { filter: 'open' },
    });

    // For each board, fetch lists
    for (const board of boards) {
      const lists = await trelloClient.get<TrelloList[]>(`boards/${board.id}/lists`, {
        token,
        key,
        params: { filter: 'open' },
      });

      for (const list of lists) {
        tables.push(buildTablePath(board.name, list.name));
      }
    }

    return tables;
  } catch (error) {
    if (error instanceof TrelloRecordError) {
      throw error;
    }

    throw new TrelloRecordError(`Failed to get table list: ${error}`);
  }
};
