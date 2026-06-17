import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';
import { SlackChannelHistoryResponseType, TSlackMessage } from '../response-types';

const action = 'get_channel_history';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  oldest: {
    type: 'float',
    required: false,
  },
  latest: {
    type: 'float',
    required: false,
  },
  inclusive: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  includeAllMetadata: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'int',
    required: false,
    default_value: 200,
  },
} satisfies TQoreOptions;

const GetChannelHistory = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackChannelHistoryResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const oldest = obj?.oldest;
    const latest = obj?.latest;
    const inclusive = obj?.inclusive ?? false;
    const includeAllMetadata = obj?.includeAllMetadata ?? false;
    const limit = obj?.limit ?? 200;

    try {
      const params: Record<string, any> = {
        channel,
        inclusive,
        include_all_metadata: includeAllMetadata,
      };

      if (oldest !== undefined) params.oldest = oldest;
      if (latest !== undefined) params.latest = latest;

      const messages = await slackClient.fetchPaginatedPost<TSlackMessage>({
        token,
        path: 'conversations.history',
        itemsPath: 'messages',
        params,
        maxResults: limit,
      });

      return { messages };
    } catch (error) {
      throw new SlackError(`Failed to get channel history: ${error.message || error}`);
    }
  },
});

export default GetChannelHistory;
