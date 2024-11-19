import { Client, collectPaginatedAPI } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction, Property } from '../../../../core/framework';
import { TQoreResponseType } from '../../../../global/models/qore';

const getCommentsResponseType = {
  type: 'hash',
  fields: {
    results: {
      type: 'list',
      display_name: 'Results',
      short_desc: 'The results of the get comments',
      desc: 'The results of the get comments',
      example_value: [
        {
          object: 'block',
          id: '107ba26f-2e25-81f1-8d47-ded9ec80be99',
          parent: {
            type: 'page_id',
            page_id: '107ba26f-2e25-8150-ab99-fc7d61b8f011',
          },
          created_time: '2024-09-20T14:51:00.000Z',
          last_edited_time: '2024-09-20T14:51:00.000Z',
          created_by: { object: 'user', id: '105d872b-594c-811f-93c6-0027f7d2d6d3' },
          last_edited_by: { object: 'user', id: '105d872b-594c-811f-93c6-0027f7d2d6d3' },
          has_children: false,
          archived: false,
          in_trash: false,
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'This is a test comment',
                  link: 'https://example.com',
                },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: 'This is a test comment',
              },
            ],
            color: 'default',
          },
        },
      ],
    },
  },
} satisfies TQoreResponseType;

export const getComments = createAction({
  auth: notionAuth,
  name: 'get_comments',
  displayName: 'Get Comments',
  description: 'Retrieve a list of comments for a block',
  responseType: getCommentsResponseType,
  props: {
    blockId: Property.ShortText({
      displayName: 'Block ID',
      description: 'The ID of the block you want to retrieve comments for',
      required: true,
    }),
  },
  async run(context) {
    const { blockId } = context.propsValue;

    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    const comments = await collectPaginatedAPI(notion.blocks.children.list, { block_id: blockId });

    return { results: comments };
  },
});
