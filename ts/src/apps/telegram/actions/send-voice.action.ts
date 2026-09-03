/**
 * Send Voice Action
 *
 * Sends an audio file to a chat as a voice message, which Telegram shows as a playable voice
 * note. The file must be OGG encoded with OPUS, MP3, or M4A.
 *
 * @see https://core.telegram.org/bots/api#sendvoice
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';
import { TelegramVoiceType } from '../response-types';

const action = 'send_voice';

export const TELEGRAM_DEFAULT_VOICE_FILE_NAME = 'voice.ogg';
export const TELEGRAM_DEFAULT_VOICE_MIME_TYPE = 'audio/ogg';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    allowed_values_creatable: true,
    type: 'number',
  },
  voice: {
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
  duration: {
    required: false,
    type: 'integer',
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

const sendVoice = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, voice, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['voice', 'chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    const {
      protect_content = false,
      disable_notification = false,
      caption_format = 'plain',
      caption,
      duration,
    } = obj || {};

    try {
      const voiceBuffer = Buffer.from(voice.content, 'base64');

      // the file name and content type tell Telegram which container the bytes are in
      const response = await client.sendVoice(
        chat,
        voiceBuffer,
        {
          ...(disable_notification && { disable_notification }),
          ...(caption && { caption }),
          ...(caption && caption_format !== 'plain' && { parse_mode: caption_format as ParseMode }),
          ...(Number.isFinite(duration) && { duration }),
          ...(protect_content && { protect_content }),
        },
        {
          filename: voice.name || TELEGRAM_DEFAULT_VOICE_FILE_NAME,
          contentType: voice.mime_type || TELEGRAM_DEFAULT_VOICE_MIME_TYPE,
        }
      );

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
      voice: {
        type: TelegramVoiceType,
        short_desc: 'The sent voice message; its file_id can be passed to the get_file action',
      },
      caption: { type: 'string' },
    },
  },
});

export default sendVoice;
