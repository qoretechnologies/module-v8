import { Client } from '@notionhq/client';
import { createAction, Property } from 'core/framework';
import { notionAuth } from '../..';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const getUserResponseType = {
  type: 'hash',
  fields: {
    object: {
      type: 'string',
      display_name: 'Object',
      short_desc: 'The type of object returned',
      desc: 'The type of object returned in this case it will always be user',
      example_value: 'user',
    },
    id: {
      type: 'string',
      display_name: 'ID',
      short_desc: 'The ID of the user',
      desc: 'The ID of the user',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    name: {
      type: 'string',
      display_name: 'Name',
      short_desc: 'The name of the user',
      desc: 'The name of the user',
      example_value: 'John Doe',
    },
    avatar_url: {
      type: 'string',
      display_name: 'Avatar URL',
      short_desc: 'The URL of the user avatar',
      desc: 'The URL of the user avatar',
      example_value: 'https://example.com/avatar.jpg',
    },
    type: {
      type: 'string',
      display_name: 'Type',
      short_desc: 'The type of user',
      desc: 'The type of user - [person, bot, ...]',
      example_value: 'person',
    },
    person: {
      required: false,
      type: {
        type: 'hash',
        fields: {
          email: {
            type: 'string',
            display_name: 'Email',
            short_desc: 'The email of the person',
            desc: 'The email of the person',
            example_value: 'email@example.com',
          },
        },
      },
      display_name: 'Person',
      short_desc: 'The person object',
      desc: 'The person object',
    },
    bot: {
      required: false,
      type: {
        type: 'hash',
        fields: {
          workspace_name: {
            type: 'string',
            display_name: 'Workspace Name',
            short_desc: 'The workspace name of the bot',
            desc: 'The workspace name of the bot',
            example_value: 'Workspace Name',
          },
          owner: {
            type: 'hash',
            display_name: 'Owner',
            short_desc: 'The owner of the bot',
            desc: 'The owner of the bot',
            example_value: {
              id: '12345678-1234-1234-1234-123456789012',
              name: 'John Doe',
              type: 'person',
              person: {
                email: 'email@example.com',
              },
            },
          },
        },
      },
      display_name: 'Bot',
      short_desc: 'The bot object',
      desc: 'The bot object',
    },
    request_id: {
      type: 'string',
      display_name: 'Request ID',
      short_desc: 'The request ID',
      desc: 'The request ID',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
  },
} satisfies TQoreResponseType;

export const getUser = createAction({
  auth: notionAuth,
  name: 'get_user',
  displayName: 'Get User',
  description: 'Retrieve a user object using their ID',
  responseType: getUserResponseType,
  props: {
    userId: Property.ShortText({
      displayName: 'User ID',
      description: 'The ID of the user you want to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { userId } = context.propsValue;

    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    return await notion.users.retrieve({ user_id: userId });
  },
});
