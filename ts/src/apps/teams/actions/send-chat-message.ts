import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTeamsChatIdAllowedValues } from '../helpers/get-chat-id-allowed-values';

const options = {
  chatId: {
    type: 'string',
    get_allowed_values: getTeamsChatIdAllowedValues,
    required: true,
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
      type: 'bool',
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const SendTeamsChatMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'send-chat-message',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const chatId = data?.chatId;
    const message = data?.message;
    const contentType = data?.contentType || 'text';

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!chatId) missingValues.push('chatId');
    if (!message) missingValues.push('message');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to send Teams chat message`
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
          contentType,
        },
      };

      const response = await client.api(`/chats/${chatId}/messages`).post(messageBody);

      return {
        id: response.id,
        success: true,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to send message to Teams chat: ${error.message}`);
    }
  },
  options,
  response_type,
});

export default SendTeamsChatMessage;
