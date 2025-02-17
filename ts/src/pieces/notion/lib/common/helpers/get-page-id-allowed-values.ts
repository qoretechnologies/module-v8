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

export const getNotionPageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Notion token is required for pageId allowed values');
  }

  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const pages: IQoreAllowedValue<string>[] = [];

  const notionPages: SearchResponse['results'] = [];
  let cursor = undefined;
  const startTime = Date.now();

  try {
    do {
      if (Date.now() - startTime > NOTION_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Notion pages`);
        break;
      }

      const response = await notion.search({
        filter: {
          property: 'object',
          value: 'page',
        },
        start_cursor: cursor,
        page_size: 100,
      });

      notionPages.push(...response.results);
      cursor = response.next_cursor ? response.next_cursor : undefined;

      if (cursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (cursor);
  } catch (error) {
    Debugger.log(`Error fetching Notion pages: ${error}`);

    return pages;
  }

  notionPages.forEach((page) => {
    const title =
      // @ts-expect-error Not all pages have a Name property
      page.properties.Name?.title[0]?.plain_text ??
      // @ts-expect-error Not all pages have a Name property
      page.properties.title?.title[0]?.text?.content ??
      'No Title';

    pages.push({
      value: page.id,
      display_name: title,
    });
  });

  return pages;
};
