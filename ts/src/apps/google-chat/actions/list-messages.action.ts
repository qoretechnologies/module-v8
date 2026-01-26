import { chat_v1 } from '@googleapis/chat';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';
import { getGoogleChatSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

const options = {
  spaceId: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
  },
  pageSize: {
    type: 'number',
    required: false,
    default_value: 25,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'createTime', display_name: 'Create Time' },
            { value: 'thread.name', display_name: 'Thread' },
          ],
          on_change: ['refetch'],
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
  showDeleted: {
    type: 'bool',
    required: false,
  },
  sortOrder: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'ASC', display_name: 'Ascending' },
      { value: 'DESC', display_name: 'Descending' },
    ],
    default_value: 'ASC',
  },
} satisfies TQoreOptions;

const listMessages = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'list_messages',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spaceId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['spaceId'],
      ErrorClass: GoogleChatError,
    });

    const pageSize = obj?.pageSize?.toString() || '20';
    const pageToken = obj?.pageToken;
    const filter = obj?.filter;
    const showDeleted = obj?.showDeleted || false;
    const sortOrder = obj?.sortOrder || 'ASC';

    try {
      const params = {
        pageSize,
        ...(pageToken && { pageToken }),
        ...(filter && { [filter.field]: filter.value }),
        ...(showDeleted && { showDeleted: showDeleted.toString() }),
        ...(sortOrder && { orderBy: `createTime ${sortOrder}` }),
      };

      const response = await QorusRequest.get<{ data: chat_v1.Schema$ListMessagesResponse }>(
        {
          path: `/v1/${spaceId}/messages`,
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to list messages: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      messages: {
        type: {
          type: 'list',
          element_type: {
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
      },
      nextPageToken: { type: 'string' },
    },
  },
});

export default listMessages;
