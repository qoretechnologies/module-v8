import { createAction } from 'core/framework';
import { assertNotNullOrUndefined } from 'core/shared';
import { IActionResponse } from 'global/models/actions';
import { slackAuth } from '../../';
import { blocks, profilePicture, text, userId, username } from '../common/props';
import { slackSendMessage } from '../common/utils';

const slackSendDirectMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the message was sent successfully',
      desc: 'Indicates if the message was sent successfully',
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
      },
    },
  },
} satisfies IActionResponse;

export const slackSendDirectMessageAction = createAction({
  auth: slackAuth,
  name: 'send_direct_message',
  displayName: 'Send Message To A User',
  description: 'Send message to a user',
  props: {
    userId,
    text,
    username,
    profilePicture,
    blocks,
  },
  responseType: slackSendDirectMessageResponseType,
  async run(context) {
    const token = context.auth.access_token;
    const { text, userId, blocks } = context.propsValue;

    assertNotNullOrUndefined(token, 'token');
    assertNotNullOrUndefined(text, 'text');
    assertNotNullOrUndefined(userId, 'userId');

    return slackSendMessage({
      token,
      text,
      username: context.propsValue.username,
      profilePicture: context.propsValue.profilePicture,
      conversationId: userId,
      blocks,
    });
  },
});
