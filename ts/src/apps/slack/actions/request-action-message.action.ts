import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { slackClient } from '../client';
import { SLACK_APP_NAME, SlackError } from '../constants';
import { getSlackChannelsAllowedValues, buildActionBlocks } from '../helpers';
import { SlackSendMessageResponseType } from '../response-types';

const action = 'request_action_message';

const options = {
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getSlackChannelsAllowedValues,
  },
  text: {
    type: 'string',
    required: true,
  },
  actions: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          title: {
            type: 'string',
            required: true,
          },
          url: {
            type: 'string',
            required: true,
          },
        },
      },
    },
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
} satisfies TQoreOptions;

const RequestActionMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SLACK_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: SlackSendMessageResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, channel, text, actions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['channel', 'text', 'actions'],
      connectionFields: ['token'],
      ErrorClass: SlackError,
    });

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      throw new SlackError('Must have at least one action button');
    }

    // Validate actions
    for (const action of actions) {
      if (!action.title) {
        throw new SlackError('Button title cannot be empty');
      }
      if (!action.url) {
        throw new SlackError('Button URL cannot be empty');
      }
    }

    const username = obj?.username;
    const iconUrl = obj?.iconUrl;

    try {
      const blocks = buildActionBlocks(text, actions);

      const body: Record<string, any> = {
        channel,
        text,
        blocks,
      };

      if (username) body.username = username;
      if (iconUrl) body.icon_url = iconUrl;

      const result = await slackClient.post<{ ok: boolean; channel: string; ts: string; message: any }>(
        'chat.postMessage',
        body,
        { token }
      );

      return result;
    } catch (error) {
      throw new SlackError(`Failed to send action message: ${error.message || error}`);
    }
  },
});

export default RequestActionMessage;
