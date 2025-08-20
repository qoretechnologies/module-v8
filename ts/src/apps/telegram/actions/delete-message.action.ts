import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'delete_message';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    type: 'number',
  },
  message_id: {
    required: true,
    type: 'integer',
  },
} satisfies TQoreOptions;

const deleteMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, message_id, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['message_id', 'chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    try {
      const response = await client.deleteMessage(chat, message_id);

      return {
        success: response,
        chat_id: chat,
        message_id,
        deleted: true,
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
      deleted: { type: 'boolean' },
    },
  },
});

export default deleteMessage;
