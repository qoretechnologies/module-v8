import { Client } from '@notionhq/client';
import { SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  IQoreAllowedValue,
  TQoreGetAllowedValuesFunction,
} from '../../../../../global/models/qore';

export const getNotionPageIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
  } = context;

  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const pages: IQoreAllowedValue[] = [];

  const notionPages: SearchResponse['results'] = [];
  let cursor = undefined;

  do {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      start_cursor: cursor,
      page_size: 100,
    });

    notionPages.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);

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
