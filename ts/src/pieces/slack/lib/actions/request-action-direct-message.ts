import { createAction } from 'core/framework';
import { assertNotNullOrUndefined } from 'core/shared';
import { slackAuth } from '../..';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { actions, profilePicture, text, userId, username } from '../common/props';
import { requestAction } from '../common/request-action';

const requestActionDirectMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the action was successfully requested',
      desc: 'Indicates if the action was successfully requested',
      example_value: true,
    },
    channel: {
      type: 'string',
      display_name: 'Channel',
      short_desc: 'The channel where the message was sent',
      desc: 'The channel where the message was sent',
      example_value: 'C1234567890',
    },
    ts: {
      type: 'string',
      display_name: 'Timestamp',
      short_desc: 'The timestamp of the message',
      desc: 'The timestamp of the message',
      example_value: '1234567890.123456',
    },
    message: {
      display_name: 'Message',
      short_desc: 'The message that was sent',
      desc: 'The message that was sent',
      type: {
        type: 'hash',
        fields: {
          user: {
            type: 'string',
            display_name: 'User',
            short_desc: 'The user who sent the message',
            desc: 'The user who sent the message',
            example_value: 'U1234567890',
          },
          type: {
            type: 'string',
            display_name: 'Type',
            short_desc: 'The type of message',
            desc: 'The type of message',
            example_value: 'message',
          },
          ts: {
            type: 'string',
            display_name: 'Timestamp',
            short_desc: 'The timestamp of the message',
            desc: 'The timestamp of the message',
            example_value: '1234567890.123456',
          },
          bot_id: {
            type: 'string',
            display_name: 'Bot ID',
            short_desc: 'The ID of the bot that sent the message',
            desc: 'The ID of the bot that sent the message',
            example_value: 'B1234567890',
          },
          app_id: {
            type: 'string',
            display_name: 'App ID',
            short_desc: 'The ID of the app that sent the message',
            desc: 'The ID of the app that sent the message',
            example_value: 'A1234567890',
          },
          text: {
            type: 'string',
            display_name: 'Text',
            short_desc: 'The text of the message',
            desc: 'The text of the message',
            example_value: 'Hello, world!',
          },
          team: {
            type: 'string',
            display_name: 'Team',
            short_desc: 'The team that sent the message',
            desc: 'The team that sent the message',
            example_value: 'T1234567890',
          },
          bot_profile: {
            display_name: 'Bot Profile',
            short_desc: 'The profile of the bot that sent the message',
            desc: 'The profile of the bot that sent the message',
            type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                  display_name: 'ID',
                  short_desc: 'The ID of the bot',
                  desc: 'The ID of the bot',
                  example_value: 'B1234567890',
                },
                app_id: {
                  type: 'string',
                  display_name: 'App ID',
                  short_desc: 'The ID of the app',
                  desc: 'The ID of the app',
                  example_value: 'A1234567890',
                },
                name: {
                  type: 'string',
                  display_name: 'Name',
                  short_desc: 'The name of the bot',
                  desc: 'The name of the bot',
                  example_value: 'bot',
                },
                deleted: {
                  type: 'boolean',
                  display_name: 'Deleted',
                  short_desc: 'Indicates if the bot is deleted',
                  desc: 'Indicates if the bot is deleted',
                  example_value: false,
                },
                updated: {
                  type: 'number',
                  display_name: 'Updated',
                  short_desc: 'The date the bot was updated',
                  desc: 'The date the bot was updated',
                  example_value: 1629983662,
                },
                team_id: {
                  type: 'string',
                  display_name: 'Team ID',
                  short_desc: 'The team ID of the bot',
                  desc: 'The team ID of the bot',
                  example_value: 'T1234567890',
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const requestActionDirectMessageAction = createAction({
  auth: slackAuth,
  name: 'request_action_direct_message',
  displayName: 'Request Action from A User',
  description: 'Send a message to a user and wait until the user selects an action',
  props: {
    userId,
    text,
    actions,
    username,
    profilePicture,
  },
  responseType: requestActionDirectMessageResponseType,
  async run(context) {
    const { userId } = context.propsValue;
    assertNotNullOrUndefined(userId, 'userId');

    return await requestAction(userId, context);
  },
});
