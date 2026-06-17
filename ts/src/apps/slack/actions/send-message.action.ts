import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues, processMessageTimestamp } from '../helpers';
import { SlackSendMessageResponseType } from '../response-types';

const action = 'send_message';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackChannelsAllowedValues,
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
  threadTs: {
    type: 'string',
    required: false,
  },
  blocks: {
    type: 'any',
    required: false,
  },
} satisfies TQoreOptions;

const SendMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackSendMessageResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'text'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const username = obj?.username;
    const iconUrl = obj?.iconUrl;
    const threadTs = obj?.threadTs ? processMessageTimestamp(obj.threadTs) : undefined;
    const blocks = obj?.blocks;

    try {
      const body: Record<string, any> = {
        channel,
        text,
      };

      if (username) body.username = username;
      if (iconUrl) body.icon_url = iconUrl;
      if (threadTs) body.thread_ts = threadTs;
      if (blocks) body.blocks = blocks;

      const result = await slackClient.post<{ ok: boolean; channel: string; ts: string; message: any }>(
        'chat.postMessage',
        body,
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to send message: ${error.message || error}`);
    }
  },
});

export default SendMessage;
