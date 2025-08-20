import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'send_photo';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    type: 'number',
  },
  photo: {
    type: 'file',
    required: true,
  },
  caption_format: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'plain', display_name: 'Plain Text' },
      { value: 'Markdown', display_name: 'Markdown' },
      { value: 'MarkdownV2', display_name: 'Markdown V2' },
      { value: 'HTML', display_name: 'HTML' },
    ],
  },
  caption: {
    required: false,
    preselected: true,
    type: 'string',
  },
  protect_content: {
    required: false,
    type: 'boolean',
  },
  disable_notification: {
    required: false,
    type: 'boolean',
  },
} satisfies TQoreOptions;

const sendPhoto = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, photo, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['photo', 'chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    const {
      protect_content = false,
      disable_notification = false,
      caption_format = 'plain',
      caption,
    } = obj || {};

    try {
      const photoBuffer = Buffer.from(photo.content, 'base64');

      const response = await client.sendPhoto(chat, photoBuffer, {
        ...(disable_notification && { disable_notification }),
        ...(caption && { caption, parse_mode: caption_format as ParseMode }),
        ...(protect_content && { protect_content }),
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
      photo: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              file_id: { type: 'string' },
              file_unique_id: { type: 'string' },
              file_size: { type: 'integer' },
              width: { type: 'integer' },
              height: { type: 'integer' },
            },
          },
        },
      },
      caption: { type: 'string' },
    },
  },
});

export default sendPhoto;
