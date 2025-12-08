import { chat_v1 } from '@googleapis/chat';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';
import { getGoogleChatMessageIdAllowedValues } from '../helpers/get-message-id-allowed-values';
import { getGoogleChatSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

interface GoogleChatMessageRequest {
  text?: string;
}

const options = {
  spaceId: {
    required: true,
    preselected: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
    on_change: ['refetch'],
  },
  text: {
    type: 'string',
    required: true,
  },
  messageId: {
    required: false,
    type: 'string',
    get_allowed_values: getGoogleChatMessageIdAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const sendMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'send_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spaceId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['spaceId'],
      ErrorClass: GoogleChatError,
    });

    const { messageId, text } = obj || {};

    if (!text) {
      throw new GoogleChatError('text must be provided');
    }

    try {
      const requestBody: GoogleChatMessageRequest = {
        text: text,
      };

      const queryParams: Record<string, string> = {};
      if (messageId) queryParams.messageId = messageId;

      const response = await QorusRequest.post<{ data: chat_v1.Schema$Message }>(
        {
          path: `/v1/${spaceId}/messages`,
          params: queryParams,
          data: requestBody,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to send a message: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: { type: 'string' },
      sender: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            displayName: { type: 'string' },
            domainId: { type: 'string' },
            type: { type: 'string' },
            isAnonymous: { type: 'bool' },
          },
        },
      },
      createTime: { type: 'string' },
      lastUpdateTime: { type: 'string' },
      deleteTime: { type: 'string' },
      text: { type: 'string' },
      thread: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            threadKey: { type: 'string' },
          },
        },
      },
      space: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
          },
        },
      },
      argumentText: { type: 'string' },
      clientAssignedMessageId: { type: 'string' },
    },
  },
});

export default sendMessage;
