import { slackAuth } from '../../';
import { slackChannel, slackInfo } from '../common/props';

import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { IActionResponse } from 'global/models/actions';
import { processMessageTimestamp } from '../common/utils';

const addReactionToMessageResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the reaction was successfully added',
      desc: 'Indicates if the reaction was successfully added',
      example_value: true,
    },
  },
} satisfies IActionResponse;

export const addReactionToMessageAction = createAction({
  auth: slackAuth,
  name: 'slack-add-reaction-to-message',
  displayName: 'Add Reaction to Message',
  description: 'Add an emoji reaction to a message.',
  responseType: addReactionToMessageResponseType,
  props: {
    info: slackInfo,
    channel: slackChannel(true),
    ts: Property.ShortText({
      displayName: 'Message Timestamp',
      description:
        'Please provide the timestamp of the message you wish to react, such as `1710304378.475129`. Alternatively, you can easily obtain the message link by clicking on the three dots next to the message and selecting the `Copy link` option.',
      required: true,
    }),
    reaction: Property.ShortText({
      displayName: 'Reaction (emoji) name',
      required: true,
      description: 'e.g.`thumbsup`',
    }),
  },

  async run(context) {
    const { channel, ts, reaction } = context.propsValue;

    const slack = new WebClient(context.auth.access_token);

    const messageTimestamp = processMessageTimestamp(ts);

    if (messageTimestamp) {
      const response = await slack.reactions.add({
        channel,
        timestamp: messageTimestamp,
        name: reaction,
      });

      return response;
    } else {
      throw new Error('Invalid Timestamp Value.');
    }
  },
});
