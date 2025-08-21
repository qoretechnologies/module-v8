import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'edit_message';

const options = {
  chat: {
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    type: 'number',
  },
  message_id: {
    required: true,
    type: 'integer',
  },
  text: {
    required: true,
    type: 'string',
  },
  parse_mode: {
    required: false,
    type: 'string',
    default_value: 'plain',
    allowed_values: [
      { value: 'plain', display_name: 'Plain Text' },
      { value: 'Markdown', display_name: 'Markdown' },
      { value: 'MarkdownV2', display_name: 'Markdown V2' },
      { value: 'HTML', display_name: 'HTML' },
    ],
  },
  disable_web_page_preview: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const editMessageText = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, message_id, chat, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['message_id', 'chat', 'text'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    const { parse_mode = 'plain', disable_web_page_preview = false } = obj || {};

    try {
      const editOptions: any = {
        disable_web_page_preview,
      };

      if (parse_mode !== 'plain') {
        editOptions.parse_mode = parse_mode as ParseMode;
      }

      const response = await client.editMessageText(text, {
        chat_id: chat,
        message_id,
        ...editOptions,
      });

      return response;
    } catch (error) {
      throw new TelegramError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'integer' },
      from: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'integer' },
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
            id: { type: 'integer' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            username: { type: 'string' },
            type: { type: 'string' },
          },
        },
      },
      date: { type: 'integer' },
      edit_date: { type: 'integer' },
      text: { type: 'string' },
      entities: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              offset: { type: 'integer' },
              length: { type: 'integer' },
              type: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default editMessageText;
