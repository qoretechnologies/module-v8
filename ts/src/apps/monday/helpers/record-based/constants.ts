import { MONDAY_BOARD_PAGE_SIZE, MONDAY_ITEMS_PAGE_SIZE } from '../../constants';
import { callMondayAPI, fetchAllMondayPages } from '../constants';
import {
  buildMondayFilter,
  formatMondayQueryFieldValues,
  serializeMondayQueryParams,
} from './apply-where-condition';

type TMondayBoard = {
  id: string;
  name: string;
  access_level: string;
  type: string;
};

export type TMondayItem = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  column_values: Array<{
    id: string;
    text: string;
    value: string;
    type: string;
    column: {
      title: string;
      settings?: any;
    };
  }>;
};

export type TMondayItemsPageResponse = {
  data: {
    boards: Array<{
      groups: Array<{
        items_page: {
          cursor: string | null;
          items: Array<TMondayItem>;
        };
      }>;
      items_page: {
        cursor: string | null;
        items: Array<TMondayItem>;
      };
    }>;
  };
};
export const getMondayBoards = async (token: string) => {
  try {
    // `boards` returns only the first 25 rows when `limit` is omitted; this list backs board
    // name-to-ID resolution for the whole table interface, so a truncated page makes every board
    // past the first 25 unaddressable by name.
    const boards = await fetchAllMondayPages<TMondayBoard>({
      token,
      collection: 'boards',
      pageSize: MONDAY_BOARD_PAGE_SIZE,
      buildQuery: (limit, page) => `
            query {
              boards(limit: ${limit}, page: ${page}) {
                id
                name
                access_level
                board_kind
                type
              }
            }
          `,
    });

    return boards.filter((board) => board.type === 'board');
  } catch (error) {
    throw new Error(`Failed to fetch Monday boards: ${error.message}`);
  }
};

export const getMondayBoardNameToIdMap = async (token: string): Promise<Record<string, string>> => {
  const boards = await getMondayBoards(token);

  const boardNameToIdMap: Record<string, string> = {};

  boards.forEach((board) => {
    boardNameToIdMap[board.name] = board.id;
  });

  return boardNameToIdMap;
};

export const getMondayBoardIdByName = async (
  token: string,
  boardName: string
): Promise<string | null> => {
  const boards = await getMondayBoards(token);
  const board = boards.find((b) => b.name === boardName);
  return board ? board.id : null;
};

export const fetchMondayRecordIds = async (options: {
  token: string;
  boardId: string;
  where?: any;
  groupId?: string;
}): Promise<string[]> => {
  const { token, boardId, where, groupId } = options;

  const formattedWhere = where ? await formatMondayQueryFieldValues(token, boardId, where) : null;
  const queryParams = formattedWhere ? buildMondayFilter(formattedWhere) : undefined;

  const recordIds: string[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  const buildQuery = (cursorValue: string | null): string => {
    const itemsPageParams = [
      `limit: ${MONDAY_ITEMS_PAGE_SIZE}`,
      cursorValue ? `cursor: "${cursorValue}"` : null,
      !cursorValue && queryParams
        ? `query_params: ${serializeMondayQueryParams(queryParams)}`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    const itemsPageFragment = `
            items_page(${itemsPageParams}) {
              cursor
              items {
                id
              }
            }`;

    if (groupId) {
      return `
        query {
          boards(ids: ${boardId}) {
            groups(ids: "${groupId}") {${itemsPageFragment}
            }
          }
        }
      `;
    }

    return `
      query {
        boards(ids: ${boardId}) {${itemsPageFragment}
        }
      }
    `;
  };

  while (hasMore) {
    const query = buildQuery(cursor);

    const response = await callMondayAPI<TMondayItemsPageResponse>({
      token,
      query,
    });

    const itemsPage = groupId
      ? response.data?.boards?.[0]?.groups?.[0]?.items_page
      : response.data?.boards?.[0]?.items_page;

    // this list decides which records an update or a delete touches, so an unresolved page is an
    // error: treating it as the end of the collection would quietly narrow the operation instead
    if (!itemsPage) {
      throw new Error(
        `Monday returned no items page for board ${boardId}` +
          `${groupId ? ` group ${groupId}` : ''} while collecting record IDs`
      );
    }

    const items = itemsPage.items || [];
    recordIds.push(...items.map((item: any) => item.id));

    cursor = itemsPage.cursor;
    hasMore = cursor !== null && items.length === MONDAY_ITEMS_PAGE_SIZE;
  }

  return recordIds;
};
