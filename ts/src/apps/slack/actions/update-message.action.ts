import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues, processMessageTimestamp } from '../helpers';
import { SlackUpdateMessageResponseType } from '../response-types';

const action = 'update_message';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  timestamp: {
    type: 'string',
    required: true,
  },
  text: {
    type: 'string',
    required: true,
  },
  blocks: {
    type: 'any',
    required: false,
  },
} satisfies TQoreOptions;

const UpdateMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackUpdateMessageResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, timestamp, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'timestamp', 'text'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const messageTimestamp = processMessageTimestamp(timestamp);
    if (!messageTimestamp) {
      throw new SlackError('Invalid timestamp value. Provide a valid Slack message timestamp or link.');
    }

    const blocks = obj?.blocks;

    try {
      const body: Record<string, any> = {
        channel,
        ts: messageTimestamp,
        text,
      };

      if (blocks) body.blocks = blocks;

      const result = await slackClient.post<{ ok: boolean; channel: string; ts: string; text: string }>(
        'chat.update',
        body,
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to update message: ${error.message || error}`);
    }
  },
});

export default UpdateMessage;
