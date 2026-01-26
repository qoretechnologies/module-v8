import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { Chat } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';

const action = 'list_chats';

const options = {
  limit: {
    type: 'number',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const listChats = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TelegramError,
    });

    const { limit = 10 } = obj || {};

    const client = createTelegramClient(token);
    const maxIterations = 20;
    const requestLimit = 100;
    let offset = 100;
    const uniqueChatIds: number[] = [];
    const uniqueChats: Chat[] = [];

    try {
      for (let i = 0; i < maxIterations; i++) {
        const newUpdates = await client.getUpdates({
          allowed_updates: ['message'],
          limit: requestLimit,
          offset,
        });

        newUpdates.forEach((update) => {
          if (update.message?.chat?.id && !uniqueChatIds.includes(update.message.chat.id)) {
            uniqueChatIds.push(update.message.chat.id);
            uniqueChats.push(update.message.chat);
          }
        });

        if (newUpdates.length === 0 || uniqueChats.length >= limit) break;

        offset += requestLimit;
      }

      return uniqueChats;
    } catch (error) {
      throw new TelegramError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'number' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      username: { type: 'string' },
      type: { type: 'string' },
    },
  },
});

export default listChats;
