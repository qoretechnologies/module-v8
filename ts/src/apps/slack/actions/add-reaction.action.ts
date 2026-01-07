import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';
import { processMessageTimestamp } from '../helpers/message-utils';
import { SlackAddReactionResponseType } from '../response-types';

const action = 'add_reaction';

const options = {
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  timestamp: {
    type: 'string',
    required: true,
  },
  reaction: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const AddReaction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackAddReactionResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, timestamp, reaction } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'timestamp', 'reaction'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const messageTimestamp = processMessageTimestamp(timestamp);
    if (!messageTimestamp) {
      throw new SlackError('Invalid timestamp value. Provide a valid Slack message timestamp or link.');
    }

    try {
      const result = await slackClient.post<{ ok: boolean }>(
        'reactions.add',
        {
          channel,
          timestamp: messageTimestamp,
          name: reaction,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to add reaction: ${error.message || error}`);
    }
  },
});

export default AddReaction;
