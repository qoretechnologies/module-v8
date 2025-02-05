import { Client } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction } from 'core/framework';
import { notionCommon } from '../common';

export const removePage = createAction({
  name: 'remove_page',
  displayName: 'Remove Page',
  description: 'Remove a page from a database',
  auth: notionAuth,
  props: {
    pageId: notionCommon.page,
  },
  async run(context) {
    const pageId = context.propsValue?.pageId;

    if (!pageId) {
      throw new Error('Page ID is required for remove_page action');
    }

    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    const result = await notion.pages.update({
      page_id: pageId,
      archived: true,
    });

    return result;
  },
});
