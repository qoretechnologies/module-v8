import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';
import { getTeamsChannelIdAllowedValues } from '../helpers/get-channel-id-allowed-values';

const options = {
  teamId: {
    type: 'string',
    required: true,
    get_allowed_values: getTeamsTeamIdAllowedValues,
  },
  channelId: {
    type: 'string',
    required: true,
    depends_on: ['teamId'],
    get_allowed_values: getTeamsChannelIdAllowedValues,
  },
  message: {
    type: 'string',
    required: true,
  },
  contentType: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'text', display_name: 'Text' },
      { value: 'html', display_name: 'HTML' },
    ],
    default_value: 'text',
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    success: {
      type: 'boolean',
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

export const SendTeamsChannelMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'send-channel-message',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const teamId = data?.teamId;
    const channelId = data?.channelId;
    const message = data?.message;
    const contentType = data?.contentType || 'text';

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!teamId) missingValues.push('teamId');
    if (!channelId) missingValues.push('channelId');
    if (!message) missingValues.push('message');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to send Teams channel message`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      const messageBody = {
        body: {
          content: message,
          contentType: contentType === 'html' ? 'html' : 'text',
        },
      };

      const response = await client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(messageBody);

      return {
        id: response.id,
        success: true,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to send message to Teams channel: ${error.message}`);
    }
  },
  options,
  response_type,
});
