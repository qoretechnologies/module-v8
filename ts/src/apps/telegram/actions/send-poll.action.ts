import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ParseMode } from 'node-telegram-bot-api';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TELEGRAM_APP_NAME, TelegramError } from '../constants';
import { createTelegramClient } from '../helpers/constants';
import { GetTelegramRecentChatsAllowedValues } from '../helpers/get-recent-chats-allowed-values';

const action = 'send_poll';

const options = {
  chat: {
    required: true,
    get_allowed_values: GetTelegramRecentChatsAllowedValues,
    allowed_values_creatable: true,
    type: 'number',
  },
  question: {
    required: true,
    type: 'string',
  },
  answers: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  is_anonymous: {
    required: false,
    type: 'bool',
    default_value: true,
  },
  poll_type: {
    required: false,
    type: 'string',
    default_value: 'regular',
    allowed_values: [
      { value: 'regular', display_name: 'Regular Poll' },
      { value: 'quiz', display_name: 'Quiz' },
    ],
  },
  allows_multiple_answers: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  correct_option_id: {
    required: false,
    type: 'integer',
  },
  explanation: {
    required: false,
    type: 'string',
  },
  explanation_parse_mode: {
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
  open_period: {
    required: false,
    type: 'integer',
  },
  close_date: {
    required: false,
    type: 'integer',
  },
  is_closed: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  disable_notification: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  protect_content: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

const sendPoll = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TELEGRAM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, question, answers, chat } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['question', 'answers', 'chat'],
      ErrorClass: TelegramError,
    });

    const client = createTelegramClient(token);

    if (!answers || answers.length < 2) {
      throw new TelegramError('Poll must have at least 2 answer options');
    }

    if (answers.length > 10) {
      throw new TelegramError('Poll cannot have more than 10 answer options');
    }

    const {
      is_anonymous = true,
      poll_type = 'regular',
      allows_multiple_answers = false,
      correct_option_id,
      explanation,
      explanation_parse_mode = 'plain',
      open_period,
      close_date,
      is_closed = false,
      disable_notification = false,
      protect_content = false,
    } = obj || {};

    try {
      const pollOptions: any = {
        is_anonymous,
        type: poll_type,
        allows_multiple_answers: poll_type === 'regular' ? allows_multiple_answers : false,
        disable_notification,
        protect_content,
        is_closed,
      };

      if (poll_type === 'quiz' && correct_option_id !== undefined) {
        pollOptions.correct_option_id = correct_option_id;
      }

      if (explanation) {
        pollOptions.explanation = explanation;
        if (explanation_parse_mode !== 'plain') {
          pollOptions.explanation_parse_mode = explanation_parse_mode as ParseMode;
        }
      }

      if (open_period) {
        pollOptions.open_period = open_period;
      }

      if (close_date) {
        pollOptions.close_date = close_date;
      }

      const response = await client.sendPoll(chat, question, answers, pollOptions);

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
      poll: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            question: { type: 'string' },
            options: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    text: { type: 'string' },
                    voter_count: { type: 'integer' },
                  },
                },
              },
            },
            total_voter_count: { type: 'integer' },
            open_period: { type: 'integer' },
            close_date: { type: 'integer' },
            is_closed: { type: 'bool' },
            is_anonymous: { type: 'bool' },
            type: { type: 'string' },
            allows_multiple_answers: { type: 'bool' },
            correct_option_id: { type: 'integer' },
            explanation: { type: 'string' },
            explanation_entities: {
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
      has_protected_content: { type: 'bool' },
    },
  },
});

export default sendPoll;
