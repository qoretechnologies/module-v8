import { Client } from '@notionhq/client';
import { SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../../utils/Debugger';
import { delay } from '../../../../../global/helpers';
import { NOTION_ALLOWED_VALUES_TIMEOUT, NOTION_FETCH_DELAY } from '../constants';

export const getNotionDatabaseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Notion token is required for databaseId allowed values');
  }

  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const databases: IQoreAllowedValue<string>[] = [];

  const notionDatabases: SearchResponse['results'] = [];
  let cursor = undefined;
  const startTime = Date.now();

  try {
    do {
      if (Date.now() - startTime > NOTION_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Notion databases`);
        break;
      }

      const response = await notion.search({
        filter: {
          property: 'object',
          value: 'database',
        },
        start_cursor: cursor,
        page_size: 100,
      });

      notionDatabases.push(...response.results);
      cursor = response.next_cursor ? response.next_cursor : undefined;

      if (cursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (cursor);
  } catch (error) {
    Debugger.log(`Error fetching Notion databases: ${error}`);

    return databases;
  }

  notionDatabases.forEach((database) => {
    const title = 'title' in database ? database.title?.[0]?.plain_text : 'Untitled';

    databases.push({
      value: database.id,
      display_name: title,
    });
  });

  return databases;
};
