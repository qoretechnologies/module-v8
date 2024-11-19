import { Client } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction, Property } from 'core/framework';
import { TQoreResponseType } from '../../../../global/models/qore';

export const addCommentResponseType = {
  type: 'hash',
  fields: {
    object: {
      type: 'string',
      display_name: 'Object',
      short_desc: 'The type of object returned',
      desc: 'The type of object returned in this case it will always be comment',
      example_value: 'comment',
    },
    id: {
      type: 'string',
      display_name: 'ID',
      short_desc: 'The ID of the comment',
      desc: 'The ID of the comment',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    parent: {
      required: false,
      type: {
        type: 'hash',
        fields: {
          type: {
            type: 'string',
            display_name: 'Type',
            short_desc: 'The type of parent',
            desc: 'The type of parent - [discussion, page, ...]',
            example_value: 'discussion',
          },
          page_id: {
            required: false,
            type: 'string',
            display_name: 'ID',
            short_desc: 'The ID of the parent',
            desc: 'The ID of the parent',
            example_value: '12345678-1234-1234-1234-123456789012',
          },
        },
      },
      display_name: 'Parent',
      short_desc: 'The parent of the comment',
      desc: 'The parent of the comment',
    },
    discussion_id: {
      type: 'string',
      display_name: 'Discussion ID',
      short_desc: 'The ID of the discussion',
      desc: 'The ID of the discussion',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    created_time: {
      type: 'string',
      display_name: 'Created Time',
      short_desc: 'The time the comment was created',
      desc: 'The time the comment was created',
      example_value: '2022-02-22T00:00:00.000Z',
    },
    last_edited_time: {
      type: 'string',
      display_name: 'Last Edited Time',
      short_desc: 'The time the comment was last edited',
      desc: 'The time the comment was last edited',
      example_value: '2022-02-22T00:00:00.000Z',
    },
    created_by: {
      display_name: 'Created By',
      short_desc: 'The user who created the comment',
      desc: 'The user who created the comment',
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            display_name: 'ID',
            short_desc: 'The ID of the user',
            desc: 'The ID of the user',
            example_value: '12345678-1234-1234-1234-123456789012',
          },
          object: {
            type: 'string',
            display_name: 'Object',
            short_desc: 'The type of object',
            desc: 'The type of object - [user, bot, ...]',
            example_value: 'user',
          },
        },
      },
    },
    rich_text: {
      type: 'list',
      display_name: 'Rich Text',
      short_desc: 'The text of the comment',
      desc: 'The text of the comment',
      example_value: [
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
} satisfies TQoreResponseType;

export const addCommentToDiscussion = createAction({
  auth: notionAuth,
  name: 'add_comment_to_discussion',
  displayName: 'Add Comment to Discussion',
  description: 'Create a comment in a discussion',
  responseType: addCommentResponseType,
  props: {
    discussionId: Property.ShortText({
      displayName: 'Discussion ID',
      description: 'The ID of the discussion you want to add a comment to',
      required: true,
    }),
    text: Property.LongText({
      displayName: 'Text',
      description: 'The text of the comment you want to add',
      required: true,
    }),
  },
  async run(context) {
    const { discussionId, text } = context.propsValue;
    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    return await notion.comments.create({
      discussion_id: discussionId,
      rich_text: [{ text: { content: text } }],
    });
  },
});
