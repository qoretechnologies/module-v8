import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { MondayError } from '../../constants';
import {
  buildMondayFilter,
  formatMondayQueryFieldValues,
  serializeMondayQueryParams,
  TMondayItemsQuery,
} from './apply-where-condition';
import { getMondayBoardIdByName, TMondayItemsPageResponse } from './constants';
import { callMondayAPI, formatMondayRecordResponse } from '../constants';
import { MondaySearchOptions } from './options';

export const searchMondayRecords: TQoreSearchRecordsFunction<typeof MondaySearchOptions> = async (
  ctx,
  where,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  const tableName = opts?.table;
  const groupId = opts?.group_id as string | undefined;

  if (!tableName) {
    throw new MondayError('Table name is required in opts.table');
  }

  try {
    const boardId = await getMondayBoardIdByName(token, tableName);

    if (!boardId) {
      throw new MondayError(`Board with name "${tableName}" not found`);
    }

    const formattedWhere = where ? await formatMondayQueryFieldValues(token, boardId, where) : null;
    let queryParams = formattedWhere ? buildMondayFilter(formattedWhere) : undefined;

    const orderBy = opts.orderBy as { column: string; ascending?: boolean } | undefined;

    if (orderBy) {
      const direction = orderBy.ascending !== false ? 'asc' : 'desc';
      let column_id = orderBy.column;

      if (column_id === 'created_at') {
        column_id = '__creation_log__';
      } else if (column_id === 'updated_at') {
        column_id = '__last_updated__';
      }

      queryParams = {
        ...queryParams,
        order_by: {
          column_id,
          direction,
        },
      } as TMondayItemsQuery;
    }

    let cursor: string | null = null;
    let hasMore = true;

    const buildItemsPageQuery = (limit: number, cursorValue: string | null): string => {
      const itemsPageParams = [
        `limit: ${limit}`,
        cursorValue ? `cursor: "${cursorValue}"` : null,
        !cursorValue && queryParams
          ? `query_params: ${serializeMondayQueryParams(queryParams)}`
          : null,
      ]
        .filter(Boolean)
        .join('\n                    ');

      const itemsPageFragment = `
                  items_page(
                    ${itemsPageParams}
                  ) {
                    cursor
                    items {
                      id
                      name
                      created_at
                      updated_at
                      column_values {
                        id
                        text
                        value
                        type
                        column {
                          title
                          settings
                        }
                      }
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

    const get_records: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore) {
        return null;
      }

      try {
        const limit = Math.min(blockSize, 500);
        const query = buildItemsPageQuery(limit, cursor);

        const response = await callMondayAPI<TMondayItemsPageResponse>({
          query,
          token,
        });

        const itemsPage = groupId
          ? response.data?.boards?.[0]?.groups?.[0]?.items_page
          : response.data?.boards?.[0]?.items_page;

        if (!itemsPage || !itemsPage.items || itemsPage.items.length === 0) {
          hasMore = false;
          return null;
        }

        cursor = itemsPage.cursor;
        hasMore = cursor !== null;

        const formattedData = formatMondayRecordResponse(itemsPage.items);

        return mapObjectToColumnFormat(formattedData);
      } catch (error) {
        if (error instanceof MondayError) {
          throw error;
        }
        throw new MondayError(`Failed to search records: ${error.message || error}`);
      }
    };

    return get_records;
  } catch (error) {
    if (error instanceof MondayError) {
      throw error;
    }
    throw new MondayError(
      `Failed to initialize search for table ${tableName}: ${error.message || error}`
    );
  }
};
