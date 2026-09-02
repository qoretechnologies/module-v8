import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { pick } from 'lodash';
import { Message } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';
import { TelegramMessageMediaFields } from '../response-types';

const action = 'new_message';

const options = {
  chat: {
    type: 'number',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
  },
} satisfies TQoreOptions;

const eventFields = {
  message_id: { type: 'integer' },
  from: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'integer' },
        is_bot: { type: 'bool' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        username: { type: 'string' },
        language_code: { type: 'string' },
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
  text: {
    type: 'string',
    short_desc: 'Text of the message; only present for text messages',
  },
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
  ...TelegramMessageMediaFields,
} satisfies Record<string, TQoreAppActionOption>;

/**
 * Static example covering every declared event field; a real message never carries all media
 * types at once, so the media sub-objects are filled with realistic sample values
 */
const NEW_MESSAGE_EXAMPLE_EVENT_DATA = {
  message_id: 1042,
  from: {
    id: 123456789,
    is_bot: false,
    first_name: 'Jane',
    last_name: 'Doe',
    username: 'janedoe',
    language_code: 'en',
  },
  chat: {
    id: 123456789,
    first_name: 'Jane',
    last_name: 'Doe',
    username: 'janedoe',
    type: 'private',
  },
  date: 1735689600,
  text: 'Hello from Telegram',
  entities: [{ offset: 0, length: 5, type: 'bold' }],
  caption: 'Quarterly report',
  photo: [
    {
      file_id:
        'AgACAgIAAxkBAAIEEmXpA1vQ4kq1fV1n0S3Z8mM5Q0rxAAKS0DEbzXhJSLb7f2lZ0OKGAQADAgADcwADNgQ',
      file_unique_id: 'AQADktAxG814SUh4',
      file_size: 1275,
      width: 90,
      height: 60,
    },
    {
      file_id:
        'AgACAgIAAxkBAAIEEmXpA1vQ4kq1fV1n0S3Z8mM5Q0rxAAKS0DEbzXhJSLb7f2lZ0OKGAQADAgADbQADNgQ',
      file_unique_id: 'AQADktAxG814SUhy',
      file_size: 18342,
      width: 320,
      height: 213,
    },
    {
      file_id:
        'AgACAgIAAxkBAAIEEmXpA1vQ4kq1fV1n0S3Z8mM5Q0rxAAKS0DEbzXhJSLb7f2lZ0OKGAQADAgADeAADNgQ',
      file_unique_id: 'AQADktAxG814SUh9',
      file_size: 61207,
      width: 800,
      height: 533,
    },
  ],
  voice: {
    file_id: 'AwACAgIAAxkBAAIEE2XpA2lQ0OKGAQADBAADNgQfW9Vd0S3Z8mM5Q0rxAAKT0DEbzXhJSA',
    file_unique_id: 'AgADk9AxG814SUg',
    file_size: 45678,
    duration: 12,
    mime_type: 'audio/ogg',
  },
  audio: {
    file_id: 'CQACAgIAAxkBAAIEFGXpA3lQ0OKGAQADBAADNgQfW9Vd0S3Z8mM5Q0rxAAKU0DEbzXhJSA',
    file_unique_id: 'AgADlNAxG814SUg',
    file_size: 3456789,
    duration: 215,
    performer: 'Sample Artist',
    title: 'Sample Track',
    file_name: 'sample-track.mp3',
    mime_type: 'audio/mpeg',
  },
  document: {
    file_id: 'BQACAgIAAxkBAAIEFWXpA4lQ0OKGAQADBAADNgQfW9Vd0S3Z8mM5Q0rxAAKV0DEbzXhJSA',
    file_unique_id: 'AgADldAxG814SUg',
    file_size: 234567,
    file_name: 'quarterly-report.pdf',
    mime_type: 'application/pdf',
  },
  video: {
    file_id: 'BAACAgIAAxkBAAIEFmXpA5lQ0OKGAQADBAADNgQfW9Vd0S3Z8mM5Q0rxAAKW0DEbzXhJSA',
    file_unique_id: 'AgADltAxG814SUg',
    file_size: 5678901,
    width: 1280,
    height: 720,
    duration: 30,
    file_name: 'product-demo.mp4',
    mime_type: 'video/mp4',
  },
  video_note: {
    file_id: 'DQACAgIAAxkBAAIEF2XpA6lQ0OKGAQADBAADNgQfW9Vd0S3Z8mM5Q0rxAAKX0DEbzXhJSA',
    file_unique_id: 'AgADl9AxG814SUg',
    file_size: 987654,
    length: 384,
    duration: 8,
  },
};

const NewMessage = QoreAppCreator.createLocalizedTrigger({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, chat } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['chat'],
      ErrorClass: TelegramError,
    });

    const getItems = () => {
      return fetchLatestItems({
        token,
        chat,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `${TELEGRAM_APP_NAME}.${action}`,
      uniqueField: 'message_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const chat = context?.opts?.chat;

    // the static sample needs no credentials
    if (!token || !chat) {
      return NEW_MESSAGE_EXAMPLE_EVENT_DATA;
    }

    const items = await fetchLatestItems({ token, chat });
    const latestMessage = items.at(-1);

    if (!latestMessage) {
      return NEW_MESSAGE_EXAMPLE_EVENT_DATA;
    }

    // merge the live message over the static sample so that every declared field is present
    return {
      ...NEW_MESSAGE_EXAMPLE_EVENT_DATA,
      ...pick(latestMessage, Object.keys(eventFields)),
    };
  },
  event_info: {
    desc: 'Telegram new message received event data',
    type: {
      type: 'hash',
      fields: eventFields,
    },
  },
});

const fetchLatestItems = async (options: { token: string; chat: number }): Promise<Message[]> => {
  const { token, chat } = options;

  try {
    const client = createTelegramClient(token);

    const messages = await client.getUpdates({
      allowed_updates: ['message'],
      timeout: 5000,
      limit: 20,
      offset: -20,
    });

    return messages
      .filter((update) => update.message && update.message.chat.id === chat)
      .map((update) => update.message) as Message[];
  } catch (error) {
    throw new TelegramError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
  }
};

export default NewMessage;
