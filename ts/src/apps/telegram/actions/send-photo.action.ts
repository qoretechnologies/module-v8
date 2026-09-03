import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';
import { TelegramPhotoListType } from '../response-types';

const action = 'send_photo';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    allowed_values_creatable: true,
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
    type: 'bool',
  },
  disable_notification: {
    required: false,
    type: 'bool',
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
        ...(caption && { caption }),
        ...(caption && caption_format !== 'plain' && { parse_mode: caption_format as ParseMode }),
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
            is_bot: { type: 'bool' },
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
        type: TelegramPhotoListType,
        short_desc:
          'Available sizes of the sent photo, smallest first; use the file_id of the last element ' +
          'with the get_file action to download the largest size',
      },
      caption: { type: 'string' },
    },
  },
});

export default sendPhoto;
