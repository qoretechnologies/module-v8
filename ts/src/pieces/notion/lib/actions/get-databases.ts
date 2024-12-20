import { Client } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction } from '../../../../core/framework';

export const getAllDatabases = createAction({
  auth: notionAuth,
  name: 'get_all_databases',
  displayName: 'Get All Databases',
  description: 'Retrieve all databases',
  props: {},
  async run(context) {
    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    const databases = [];
    let cursor = undefined;

    do {
      const response = await notion.search({
        filter: {
          property: 'object',
          value: 'database',
        },
        start_cursor: cursor,
        page_size: 100,
      });

      databases.push(...response.results);
      cursor = response.next_cursor;
    } while (cursor);

    return databases;
  },
});
