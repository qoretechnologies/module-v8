import { PageObjectResponse } from '@notionhq/client';
import {
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { NotionError } from '../../constants';
import {
  createNotionClient,
  getNotionDataSourceByTitle,
  mapNotionPropertiesToSimpleObject,
} from '../constants';
import { buildNotionFilter } from './apply-where-condition';

export const searchNotionRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
  const { token } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new NotionError('Table name is required in opts.table');
  }

  try {
    const dataSource = await getNotionDataSourceByTitle({ token, titleQuery: tableName });
    const notion = createNotionClient(token);

    const filter = where ? buildNotionFilter(where, dataSource.properties) : undefined;

    const queryParams: any = {
      data_source_id: dataSource.id,
    };

    if (filter) {
      queryParams.filter = filter;
    }

    const orderBy = opts.orderBy as { column: string; ascending?: boolean };

    if (orderBy) {
      const direction = orderBy.ascending ? 'ascending' : 'descending';

      queryParams.sorts = [
        {
          ...(['created_time', 'last_edited_time'].includes(orderBy.column)
            ? {
                timestamp: orderBy.column,
              }
            : {
                property: orderBy.column,
              }),
          direction,
        },
      ];
    }

    let cursor: string | undefined;

    const get_records: TQoreSearchRecordsIterator = (_ctx, blockSize) => {
      return (async () => {
        try {
          const pagedQueryParams = {
            ...queryParams,
            page_size: Math.min(blockSize, 100),
            ...(cursor && { start_cursor: cursor }),
          };

          const response = await notion.dataSources.query(pagedQueryParams);

          if (!response.results || response.results.length === 0) {
            return null;
          }

          cursor = response.has_more ? response.next_cursor || undefined : undefined;

          const mappedData = response.results.map((page) => {
            const pageObj = page as PageObjectResponse;
            return mapNotionPropertiesToSimpleObject(
              {
                ...pageObj.properties,
                id: { type: 'id', id: pageObj.id },
                created_time: { type: 'date', date: { start: pageObj.created_time } },
                last_edited_time: { type: 'date', date: { start: pageObj.last_edited_time } },
              },
              'id'
            );
          });

          return mapObjectToColumnFormat(mappedData);
        } catch (error) {
          if (error instanceof NotionError) {
            throw error;
          }
          throw new NotionError(`Failed to search records: ${error.message || error}`);
        }
      })();
    };

    return get_records;
  } catch (error) {
    if (error instanceof NotionError) {
      throw error;
    }
    throw new NotionError(
      `Failed to initialize search for table ${tableName}: ${error.message || error}`
    );
  }
};
