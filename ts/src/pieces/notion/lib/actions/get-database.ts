import { Client } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction } from '../../../../core/framework';
import { notionCommon } from '../common';

export const getDatabase = createAction({
  auth: notionAuth,
  name: 'get_database',
  displayName: 'Get Database',
  description: 'Retrieve a database object using its ID',
  props: {
    databaseId: notionCommon.database_id,
  },
  async run(context) {
    const { databaseId } = context.propsValue;

    if (!databaseId) {
      throw new Error('The databaseId is required to retrieve a notion database');
    }

    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    return await notion.databases.retrieve({ database_id: databaseId });
  },
});
