import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'unpin_chat_message';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    allowed_values_creatable: true,
    type: 'number',
  },
  message_id: {
    required: false,
    preselected: true,
    type: 'integer',
  },
} satisfies TQoreOptions;

const unpinChatMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    const { message_id } = obj || {};

    try {
      let response;

      if (message_id) {
        response = await client.unpinChatMessage(chat, { message_id });
      } else {
        response = await client.unpinAllChatMessages(chat);
      }

      return {
        success: response,
        chat_id: chat,
        message_id: message_id || null,
        unpinned: true,
        all_messages: !message_id,
      };
    } catch (error) {
      throw new TelegramError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      chat_id: { type: 'number' },
      message_id: { type: 'integer' },
      unpinned: { type: 'boolean' },
      all_messages: { type: 'boolean' },
    },
  },
});

export default unpinChatMessage;
