import { Block, WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { slackAuth } from '../..';
import { TQoreResponseType } from '../../../../global/models/qore';
import { blocks, slackChannel, slackInfo } from '../common/props';
import { processMessageTimestamp } from '../common/utils';

const updateMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the message was updated successfully',
      desc: 'Indicates if the message was updated successfully',
      example_value: true,
    },
    channel: {
      type: 'string',
      display_name: 'Channel',
      short_desc: 'The channel where the message was updated',
      desc: 'The channel where the message was updated',
      example_value: 'C1234567890',
    },
    ts: {
      type: 'string',
      display_name: 'Timestamp',
      short_desc: 'The timestamp of the message',
      desc: 'The timestamp of the message',
      example_value: '1234567890.123456',
    },
    text: {
      type: 'string',
      display_name: 'Text',
      short_desc: 'The updated text of the message',
      desc: 'The updated text of the message',
      example_value: 'Hello, world!',
    },
  },
} satisfies TQoreResponseType;

export const updateMessage = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'updateMessage',
  displayName: 'Update message',
  description: 'Update an existing message',
  auth: slackAuth,
  props: {
    info: slackInfo,
    channel: slackChannel(true),
    ts: Property.ShortText({
      displayName: 'Message Timestamp',
      description:
        'Please provide the timestamp of the message you wish to update, such as `1710304378.475129`. Alternatively, you can easily obtain the message link by clicking on the three dots next to the message and selecting the `Copy link` option.',
      required: true,
    }),
    text: Property.LongText({
      displayName: 'Message',
      description: 'The updated text of your message',
      required: true,
    }),
    blocks,
  },
  responseType: updateMessageResponseType,
  async run({ auth, propsValue }) {
    const messageTimestamp = processMessageTimestamp(propsValue.ts);
    if (!messageTimestamp) {
      throw new Error('Invalid Timestamp Value.');
    }
    const client = new WebClient(auth.access_token);

    return await client.chat.update({
      channel: propsValue.channel,
      ts: messageTimestamp,
      text: propsValue.text,
      blocks: propsValue.blocks as unknown as Block[],
    });
  },
});
