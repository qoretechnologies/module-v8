import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'send_message';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    type: 'number',
  },
  format: {
    preselected: true,
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'plain', display_name: 'Plain Text' },
      { value: 'Markdown', display_name: 'Markdown' },
      { value: 'MarkdownV2', display_name: 'Markdown V2' },
      { value: 'HTML', display_name: 'HTML' },
    ],
  },
  message: {
    required: true,
    type: 'string',
  },
  disable_link_preview: {
    required: false,
    type: 'boolean',
  },
  disable_notification: {
    required: false,
    type: 'boolean',
  },
} satisfies TQoreOptions;

const sendMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, message, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['message', 'chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    const {
      disable_link_preview = false,
      disable_notification = false,
      format = 'plain',
    } = obj || {};

    try {
      const response = await client.sendMessage(chat, message, {
        ...(format !== 'plain' && { parse_mode: format as ParseMode }),
        ...(disable_link_preview && { disable_link_preview }),
        ...(disable_notification && { disable_notification }),
      });

      return response;
    } catch (error) {
      throw new TelegramError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'number' },
      from: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            is_bot: { type: 'boolean' },
            first_name: { type: 'string' },
            username: { type: 'string' },
          },
        },
      },
      chat: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            username: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
      date: { type: 'number' },
      text: { type: 'string' },
      entities: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              offset: { type: 'number' },
              length: { type: 'number' },
              type: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default sendMessage;
