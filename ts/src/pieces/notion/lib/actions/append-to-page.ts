import { createAction, OAuth2PropertyValue, Property } from 'core/framework';
import { Client } from '@notionhq/client';

import { notionAuth } from '../..';
import { notionCommon } from '../common';
import { markdownToBlocks } from '@tryfabric/martian';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import { IActionResponse } from '../../../../global/models/actions';

const appendToPageResponseType = {
  type: 'hash',
  fields: {
    object: {
      type: 'string',
      display_name: 'Object',
      short_desc: 'The type of object returned',
      desc: 'The type of object returned in this case it will always be block',
      example_value: 'list',
    },
    results: {
      type: 'list',
      display_name: 'Results',
      short_desc: 'The results of the append',
      desc: 'The results of the append',
      example_value: [
        {
          object: 'block',
          id: '12345678-1234-1234-1234-123456789012',
          type: 'paragraph',
          paragraph: {
            color: 'default',
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
          },
        },
      ],
    },
  },
} satisfies IActionResponse;

export const appendToPage = createAction({
  auth: notionAuth,
  name: 'append_to_page',
  displayName: 'Append to Page',
  description: 'Appends content to the end of a page.',
  responseType: appendToPageResponseType,
  props: {
    pageId: notionCommon.page,
    content: Property.LongText({
      displayName: 'Content',
      description: 'The content you want to append. You can use markdown formatting.',
      required: true,
    }),
  },
  async run(context) {
    const { pageId, content } = context.propsValue;

    const notion = new Client({
      auth: (context.auth as OAuth2PropertyValue).access_token,
      notionVersion: '2022-02-22',
    });

    return await notion.blocks.children.append({
      block_id: pageId as string,
      children: markdownToBlocks(content) as BlockObjectRequest[],
    });
  },
});
