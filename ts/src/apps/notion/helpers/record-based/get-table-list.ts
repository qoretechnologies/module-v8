import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { NotionError } from '../../constants';
import { delay, getQoreContextRequiredValues } from '../../../../global/helpers';
import { DataSourceObjectResponse } from '@notionhq/client';
import {
  createNotionClient,
  getNotionRickTextFieldPlainText,
  NOTION_FETCH_DELAY,
} from '../constants';

export const getNotionTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  const dataSources: DataSourceObjectResponse[] = [];
  let cursor = undefined;

  try {
    const client = createNotionClient(token);
    do {
      const response = await client.search({
        filter: {
          property: 'object',
          value: 'data_source',
        },
        start_cursor: cursor,
        page_size: 100,
      });

      dataSources.push(...(response.results as DataSourceObjectResponse[]));

      cursor = response.next_cursor ? response.next_cursor : undefined;

      if (cursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (cursor);

    return dataSources
      .map((ds) => getNotionRickTextFieldPlainText(ds.title))
      .filter(Boolean) as string[];
  } catch (error) {
    if (error instanceof NotionError) {
      throw error;
    }

    throw new NotionError(`Failed to get table list: ${error}`);
  }
};
