import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackUsersAllowedValues } from '../helpers';
import { SlackSendMessageResponseType } from '../response-types';

const action = 'send_direct_message';

const options = {
  userId: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackUsersAllowedValues,
  },
  text: {
    type: 'string',
    required: true,
  },
  username: {
    type: 'string',
    required: false,
  },
  iconUrl: {
    type: 'string',
    required: false,
  },
  blocks: {
    type: 'any',
    required: false,
  },
} satisfies TQoreOptions;

const SendDirectMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackSendMessageResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, userId, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['userId', 'text'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const username = obj?.username;
    const iconUrl = obj?.iconUrl;
    const blocks = obj?.blocks;

    try {
      // First, open a DM conversation with the user
      const conversationResponse = await slackClient.post<{ ok: boolean; channel: { id: string } }>(
        'conversations.open',
        { users: userId },
        { token }
      );

      const channelId = conversationResponse.channel?.id;
      if (!channelId) {
        throw new SlackError('Failed to open direct message conversation');
      }

      // Now send the message to the DM channel
      const body: Record<string, any> = {
        channel: channelId,
        text,
      };

      if (username) body.username = username;
      if (iconUrl) body.icon_url = iconUrl;
      if (blocks) body.blocks = blocks;

      const result = await slackClient.post<{ ok: boolean; channel: string; ts: string; message: any }>(
        'chat.postMessage',
        body,
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to send direct message: ${error.message || error}`);
    }
  },
});

export default SendDirectMessage;
