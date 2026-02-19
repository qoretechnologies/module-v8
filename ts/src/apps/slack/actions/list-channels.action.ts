import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { SlackListChannelsResponseType, TSlackChannel } from '../response-types';

const action = 'list_channels';

const options = {
  types: {
    type: 'string',
    required: false,
    default_value: 'public_channel,private_channel',
  },
  excludeArchived: {
    type: 'bool',
    required: false,
    default_value: true,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 200,
  },
} satisfies TQoreOptions;

const ListChannels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackListChannelsResponseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: [],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const types = obj?.types || 'public_channel,private_channel';
    const excludeArchived = obj?.excludeArchived ?? true;
    const limit = obj?.limit || 200;

    try {
      const channels = await slackClient.fetchPaginatedPost<TSlackChannel>({
        token,
        path: 'conversations.list',
        itemsPath: 'channels',
        params: {
          types,
          exclude_archived: excludeArchived,
        },
        maxResults: limit,
      });

      return { channels };
    } catch (error) {
      throw new SlackError(`Failed to list channels: ${error.message || error}`);
    }
  },
});

export default ListChannels;
