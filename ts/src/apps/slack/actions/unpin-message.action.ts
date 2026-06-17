import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues, processMessageTimestamp } from '../helpers';
import { SlackPinResponseType } from '../response-types';

const action = 'unpin_message';

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
} satisfies TQoreOptions;

const UnpinMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackPinResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, timestamp } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'timestamp'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const messageTimestamp = processMessageTimestamp(timestamp);
    if (!messageTimestamp) {
      throw new SlackError('Invalid timestamp value. Provide a valid Slack message timestamp or link.');
    }

    try {
      const result = await slackClient.post<{ ok: boolean }>(
        'pins.remove',
        { channel, timestamp: messageTimestamp },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to unpin message: ${error.message || error}`);
    }
  },
});

export default UnpinMessage;
