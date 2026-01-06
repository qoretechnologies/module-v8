import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { SlackCreateChannelResponseType } from '../response-types';

const action = 'create_channel';

const options = {
  channelName: {
    type: 'string',
    required: true,
  },
  isPrivate: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const CreateChannel = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackCreateChannelResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channelName } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channelName'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    const isPrivate = obj?.isPrivate ?? false;

    try {
      const result = await slackClient.post<{ ok: boolean; channel: any }>(
        'conversations.create',
        {
          name: channelName,
          is_private: isPrivate,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to create channel: ${error.message || error}`);
    }
  },
});

export default CreateChannel;
