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

const options = {
  spaceId: {
    required: false,
    preselected: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
    on_change: ['refetch'],
  },
  messageId: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleChatMessageIdAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const getMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'get_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, messageId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['messageId'],
      ErrorClass: GoogleChatError,
    });

    try {
      const response = await QorusRequest.get<{ data: chat_v1.Schema$Message }>(
        {
          path: `/v1/${messageId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to get message: ${error}`);
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
            isAnonymous: { type: 'boolean' },
          },
        },
      },
      createTime: { type: 'string' },
      lastUpdateTime: { type: 'string' },
      deleteTime: { type: 'string' },
      text: { type: 'string' },
      formattedText: { type: 'string' },
      cards: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      cardsV2: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      annotations: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
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
      fallbackText: { type: 'string' },
      actionResponse: {
        type: 'hash',
      },
      argumentText: { type: 'string' },
      slashCommand: {
        type: 'hash',
      },
      attachment: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      matchedUrl: {
        type: 'hash',
      },
      threadReply: { type: 'boolean' },
      clientAssignedMessageId: { type: 'string' },
      emojiReactionSummaries: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      privateMessageViewer: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            displayName: { type: 'string' },
            domainId: { type: 'string' },
            type: { type: 'string' },
            isAnonymous: { type: 'boolean' },
          },
        },
      },
      deletionMetadata: {
        type: 'hash',
      },
      quotedMessageMetadata: {
        type: 'hash',
      },
      attachedGifs: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      accessoryWidgets: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
    },
  },
});

export default getMessage;
