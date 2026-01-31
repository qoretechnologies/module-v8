/**
 * Trello Record-Based Helpers Constants
 *
 * This module provides utilities for working with Trello's hierarchical structure
 * in a record-based context where Board|List combinations are treated as "tables"
 * and Cards as "records".
 *
 * Trello hierarchy: Board -> List -> Card
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { trelloClient, TrelloRequestOptions } from '../../client';

/**
 * Custom error class for Trello record-based operations
 */
export class TrelloRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrelloRecordError';
  }
}

/**
 * Table path separator for hierarchical paths
 */
export const TABLE_PATH_SEPARATOR = '|';

/**
 * Maximum page size for Trello API
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Custom field prefix for distinguishing custom fields from standard fields
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Parsed table path components
 */
export interface TrelloTablePath {
  boardName: string;
  listName: string;
}

/**
 * Trello board from API
 */
export interface TrelloBoard {
  id: string;
  name: string;
  closed: boolean;
  url: string;
  shortUrl: string;
}

/**
 * Trello list from API
 */
export interface TrelloList {
  id: string;
  name: string;
  idBoard: string;
  closed: boolean;
  pos: number;
}

/**
 * Trello custom field definition from API
 */
export interface TrelloCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'list';
  idModel: string;
  options?: TrelloCustomFieldOption[];
}

/**
 * Trello custom field option (for list/dropdown type)
 */
export interface TrelloCustomFieldOption {
  id: string;
  idCustomField: string;
  value: {
    text: string;
  };
  color?: string;
  pos: number;
}

/**
 * Trello custom field value on a card
 */
export interface TrelloCustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  idValue?: string;
  value?: {
    text?: string;
    number?: string;
    checked?: string;
    date?: string;
  };
}

/**
 * Trello card from API
 */
export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  due: string | null;
  dueComplete: boolean;
  start: string | null;
  pos: number;
  idList: string;
  idBoard: string;
  idMembers: string[];
  idLabels: string[];
  shortUrl: string;
  url: string;
  dateLastActivity: string;
  customFieldItems?: TrelloCustomFieldItem[];
}

/**
 * Cache structure for Trello mappings
 */
type TrelloMappings = {
  boards: Map<string, TrelloBoard>;
  lists: Map<string, Map<string, TrelloList>>;
  customFields: Map<string, Map<string, TrelloCustomField>>;
};

let mappingsCache: TrelloMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheToken = null;
};

/**
 * Initialize the mappings cache by fetching all boards and their lists
 */
const initializeMappingsCache = async (token: string, key: string): Promise<void> => {
  mappingsCache = {
    boards: new Map(),
    lists: new Map(),
    customFields: new Map(),
  };
  mappingsCacheToken = token;

  // Fetch all boards
  const boards = await trelloClient.get<TrelloBoard[]>('members/me/boards', {
    token,
    key,
    params: { filter: 'open' },
  });

  for (const board of boards) {
    mappingsCache.boards.set(board.name, board);

    // Fetch lists for each board
    const lists = await trelloClient.get<TrelloList[]>(`boards/${board.id}/lists`, {
      token,
      key,
      params: { filter: 'open' },
    });

    const listsMap = new Map<string, TrelloList>();
    for (const list of lists) {
      listsMap.set(list.name, list);
    }
    mappingsCache.lists.set(board.id, listsMap);
  }
};

/**
 * Ensure cache is initialized and return it
 */
export const ensureMappingsCache = async (
  token: string,
  key: string
): Promise<TrelloMappings> => {
  if (!mappingsCache || mappingsCacheToken !== token) {
    await initializeMappingsCache(token, key);
  }
  return mappingsCache!;
};

/**
 * Get custom fields for a board (with caching)
 */
export const getCustomFieldsForBoard = async (
  options: TrelloRequestOptions & { boardId: string }
): Promise<Map<string, TrelloCustomField>> => {
  const { token, key, boardId } = options;

  if (!token || !key) {
    throw new TrelloRecordError('Token and key are required');
  }

  const cache = await ensureMappingsCache(token, key);

  // Check cache first
  if (cache.customFields.has(boardId)) {
    return cache.customFields.get(boardId)!;
  }

  // Fetch custom fields
  const customFields = await trelloClient.get<TrelloCustomField[]>(
    `boards/${boardId}/customFields`,
    { token, key }
  );

  const fieldsMap = new Map<string, TrelloCustomField>();
  for (const field of customFields) {
    fieldsMap.set(field.name, field);
  }

  cache.customFields.set(boardId, fieldsMap);
  return fieldsMap;
};

/**
 * Parse a hierarchical table path into its components.
 * Format: "boardName|listName"
 */
export const parseTablePath = (tablePath: string): TrelloTablePath => {
  const parts = tablePath.split(TABLE_PATH_SEPARATOR);

  if (parts.length !== 2) {
    throw new TrelloRecordError(
      `Invalid table path format: "${tablePath}". Expected "boardName|listName".`
    );
  }

  return {
    boardName: parts[0],
    listName: parts[1],
  };
};

/**
 * Build a hierarchical table path from components
 */
export const buildTablePath = (boardName: string, listName: string): string => {
  return `${boardName}${TABLE_PATH_SEPARATOR}${listName}`;
};

/**
 * Get board and list IDs by table path
 */
export const getIdsFromTablePath = async (
  tablePath: string,
  token: string,
  key: string
): Promise<{ boardId: string; listId: string; board: TrelloBoard; list: TrelloList }> => {
  const { boardName, listName } = parseTablePath(tablePath);
  const cache = await ensureMappingsCache(token, key);

  const board = cache.boards.get(boardName);
  if (!board) {
    throw new TrelloRecordError(`Board not found: "${boardName}"`);
  }

  const listsMap = cache.lists.get(board.id);
  if (!listsMap) {
    throw new TrelloRecordError(`Lists not found for board: "${boardName}"`);
  }

  const list = listsMap.get(listName);
  if (!list) {
    throw new TrelloRecordError(`List not found: "${listName}" in board "${boardName}"`);
  }

  return {
    boardId: board.id,
    listId: list.id,
    board,
    list,
  };
};

/**
 * Map Trello custom field type to Qore type
 */
export const mapTrelloFieldTypeToQore = (trelloType: string): TQoreType => {
  const typeMap: Record<string, TQoreType> = {
    text: 'string',
    number: 'number',
    checkbox: 'bool',
    date: 'date',
    list: 'string',
  };
  return typeMap[trelloType] || 'any';
};

/**
 * Standard card fields type definition
 */
export const STANDARD_CARD_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  name: 'string',
  desc: 'string',
  closed: 'bool',
  due: 'date',
  dueComplete: 'bool',
  start: 'date',
  pos: 'number',
  idList: 'string',
  idBoard: 'string',
  idMembers: { type: 'list', element_type: 'string' },
  idLabels: { type: 'list', element_type: 'string' },
  shortUrl: 'string',
  url: 'string',
  dateLastActivity: 'date',
};

/**
 * Transform a Trello card to a flat record format
 */
export const transformCardToRecord = (
  card: TrelloCard,
  customFieldDefs: Map<string, TrelloCustomField>
): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: card.id,
    name: card.name,
    desc: card.desc,
    closed: card.closed,
    due: card.due,
    dueComplete: card.dueComplete,
    start: card.start,
    pos: card.pos,
    idList: card.idList,
    idBoard: card.idBoard,
    idMembers: card.idMembers,
    idLabels: card.idLabels,
    shortUrl: card.shortUrl,
    url: card.url,
    dateLastActivity: card.dateLastActivity,
  };

  // Flatten custom fields with cf_ prefix
  if (card.customFieldItems) {
    for (const item of card.customFieldItems) {
      // Find field definition by id
      const fieldDef = [...customFieldDefs.values()].find((f) => f.id === item.idCustomField);
      if (!fieldDef) {
        continue;
      }

      const fieldKey = `${CUSTOM_FIELD_PREFIX}${fieldDef.name}`;

      switch (fieldDef.type) {
        case 'text':
          record[fieldKey] = item.value?.text || null;
          break;
        case 'number':
          record[fieldKey] = item.value?.number ? Number(item.value.number) : null;
          break;
        case 'checkbox':
          record[fieldKey] = item.value?.checked === 'true';
          break;
        case 'date':
          record[fieldKey] = item.value?.date || null;
          break;
        case 'list':
          // Find selected option name by idValue
          if (item.idValue && fieldDef.options) {
            const option = fieldDef.options.find((o) => o.id === item.idValue);
            record[fieldKey] = option?.value?.text || null;
          } else {
            record[fieldKey] = null;
          }
          break;
        default:
          record[fieldKey] = null;
      }
    }
  }

  return record;
};

/**
 * Transform a flat record to Trello card payload (for create/update)
 */
export const transformRecordToCardPayload = (
  record: Record<string, unknown>,
  customFieldDefs: Map<string, TrelloCustomField>
): { cardPayload: Record<string, unknown>; customFieldUpdates: Array<{ fieldId: string; value: unknown }> } => {
  const cardPayload: Record<string, unknown> = {};
  const customFieldUpdates: Array<{ fieldId: string; value: unknown }> = [];

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      // Custom field
      const fieldName = key.slice(CUSTOM_FIELD_PREFIX.length);
      const fieldDef = customFieldDefs.get(fieldName);
      if (fieldDef) {
        let apiValue: unknown;
        switch (fieldDef.type) {
          case 'text':
            apiValue = { text: value };
            break;
          case 'number':
            apiValue = { number: String(value) };
            break;
          case 'checkbox':
            apiValue = { checked: value ? 'true' : 'false' };
            break;
          case 'date':
            apiValue = { date: value };
            break;
          case 'list':
            // Find option by name
            if (fieldDef.options && typeof value === 'string') {
              const option = fieldDef.options.find((o) => o.value.text === value);
              if (option) {
                apiValue = option.id;
              }
            }
            break;
        }
        if (apiValue !== undefined) {
          customFieldUpdates.push({ fieldId: fieldDef.id, value: apiValue });
        }
      }
    } else if (key !== 'id' && STANDARD_CARD_FIELDS[key]) {
      // Standard field (exclude id)
      cardPayload[key] = value;
    }
  }

  return { cardPayload, customFieldUpdates };
};

/**
 * Normalize set values to single record (for update operations)
 */
export const normalizeSetToSingleRecord = (
  set: Record<string, unknown[] | unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(set)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
};
