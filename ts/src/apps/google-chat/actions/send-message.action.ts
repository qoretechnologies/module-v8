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

interface GoogleChatCard {
  header?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageType?: string;
  };
  sections?: Array<{
    widgets: Array<{
      buttons?: Array<{
        textButton: {
          text: string;
          onClick: {
            openLink: {
              url: string;
            };
          };
        };
      }>;
    }>;
  }>;
}

interface GoogleChatMessageRequest {
  text?: string;
  formattedText?: string;
  cards?: GoogleChatCard[];
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
    required: false,
  },
  formattedText: {
    required: false,
    type: 'string',
  },
  messageId: {
    required: false,
    type: 'string',
    get_allowed_values: getGoogleChatMessageIdAllowedValues,
    allowed_values_creatable: true,
  },
  cardTitle: {
    required: false,
    type: 'string',
  },
  cardSubtitle: {
    required: false,
    type: 'string',
  },
  cardImageUrl: {
    required: false,
    type: 'string',
  },
  buttonText: {
    required: false,
    type: 'string',
  },
  buttonUrl: {
    required: false,
    type: 'string',
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

    const {
      messageId,
      text,
      formattedText,
      cardTitle,
      cardSubtitle,
      cardImageUrl,
      buttonText,
      buttonUrl,
    } = obj || {};

    if (!text && !formattedText && !cardTitle) {
      throw new GoogleChatError(
        'At least one of text, formattedText, or cardTitle must be provided'
      );
    }

    try {
      const requestBody: GoogleChatMessageRequest = {};

      if (text) requestBody.text = text;
      if (formattedText) requestBody.formattedText = formattedText;

      const hasCardContent = cardTitle || cardSubtitle || cardImageUrl || buttonText;
      if (hasCardContent) {
        const card: GoogleChatCard = {};

        if (cardTitle || cardSubtitle || cardImageUrl) {
          card.header = {};
          if (cardTitle) card.header.title = cardTitle;
          if (cardSubtitle) card.header.subtitle = cardSubtitle;
          if (cardImageUrl) {
            card.header.imageUrl = cardImageUrl;
            card.header.imageType = 'IMAGE';
          }
        }

        if (buttonText) {
          if (!buttonUrl) {
            throw new GoogleChatError('buttonUrl is required when buttonText is provided');
          }

          card.sections = [
            {
              widgets: [
                {
                  buttons: [
                    {
                      textButton: {
                        text: buttonText,
                        onClick: {
                          openLink: {
                            url: buttonUrl,
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ];
        }

        requestBody.cards = [card];
      }

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

export default sendMessage;
