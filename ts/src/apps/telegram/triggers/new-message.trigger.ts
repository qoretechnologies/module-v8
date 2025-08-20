import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { Message } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'new_message';

const options = {
  chat: {
    type: 'number',
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
  },
} satisfies TQoreOptions;

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
    const { token, chat } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['chat'],
      ErrorClass: TelegramError,
    });

    const items = await fetchLatestItems({
      token,
      chat,
    });

    return items?.length ? items.at(-1) : null;
  },
  event_info: {
    desc: 'Telegram new message received event data',
    type: {
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
