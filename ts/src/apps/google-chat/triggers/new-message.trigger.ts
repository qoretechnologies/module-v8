import { chat_v1 } from '@googleapis/chat';
import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';
import { getGoogleChatSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

const GoogleChatNewMessageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'new_message',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    spaceId: {
      required: true,
      type: 'string',
      get_allowed_values: getGoogleChatSpaceIdAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, spaceId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['spaceId'],
      ErrorClass: GoogleChatError,
    });

    const getItems = () => {
      return fetchLatestMessages(token, spaceId);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_chat_new_message',
      uniqueField: 'name',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, spaceId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['spaceId'],
      ErrorClass: GoogleChatError,
    });

    const messages = await fetchLatestMessages(token, spaceId);

    return messages?.length > 0 ? messages[0] : null;
  },
  event_info: {
    desc: 'Google Chat New Message Trigger Event Info',
    type: {
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
        threadReply: { type: 'bool' },
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
              isAnonymous: { type: 'bool' },
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
  },
});

export default GoogleChatNewMessageTrigger;

const fetchLatestMessages = async (token: string, spaceId: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const messagesResponse = await QorusRequest.get<{
      data: chat_v1.Schema$ListMessagesResponse;
    }>(
      {
        path: `/v1/${spaceId}/messages`,
        params: {
          pageSize: limit.toString(),
          orderBy: 'createTime desc',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
    );

    const messages = messagesResponse?.data?.messages || [];

    return messages;
  } catch (error) {
    throw new GoogleChatError(`Failed to fetch latest messages: ${error}`);
  }
};
