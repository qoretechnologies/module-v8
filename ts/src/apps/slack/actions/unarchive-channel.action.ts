import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackArchivedChannelsAllowedValues } from '../helpers';
import { SlackUnarchiveChannelResponseType } from '../response-types';

const action = 'unarchive_channel';

const options = {
  channel: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSlackArchivedChannelsAllowedValues,
  },
} satisfies TQoreOptions;

const UnarchiveChannel = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackUnarchiveChannelResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    try {
      const result = await slackClient.post<{ ok: boolean }>(
        'conversations.unarchive',
        { channel },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to unarchive channel: ${error.message || error}`);
    }
  },
});

export default UnarchiveChannel;
