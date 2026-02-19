import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues } from '../helpers';
import { SlackArchiveChannelResponseType } from '../response-types';

const action = 'archive_channel';

const options = {
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
} satisfies TQoreOptions;

const ArchiveChannel = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackArchiveChannelResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    try {
      const result = await slackClient.post<{ ok: boolean }>(
        'conversations.archive',
        { channel },
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to archive channel: ${error.message || error}`);
    }
  },
});

export default ArchiveChannel;
