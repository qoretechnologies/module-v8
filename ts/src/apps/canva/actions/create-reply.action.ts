import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';
import { getCanvaDesignAllowedValues } from '../helpers/get-design-allowed-values';

const action = 'create_reply';

const options = {
  design: {
    type: 'string',
    required: true,
    get_allowed_values: getCanvaDesignAllowedValues,
  },
  thread: {
    type: 'string',
    required: true,
  },
  message: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const createReply = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, message, design, thread } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['message', 'design', 'thread'],
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    try {
      const res = await canvaApiClient<{ reply: Record<string, any> }>({
        path: `designs/${design}/comments/${thread}/replies`,
        method: 'POST',
        token,
        body: {
          message_plaintext: message,
        },
      });

      return res.reply;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      design_id: { type: 'string' },
      thread_id: { type: 'string' },
      author: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            display_name: { type: 'string' },
          },
        },
      },
      content: {
        type: {
          type: 'hash',
          fields: {
            plaintext: { type: 'string' },
            markdown: { type: 'string' },
          },
        },
      },
      mentions: {
        type: {
          type: 'hash',
        },
      },
      created_at: { type: 'integer' },
      updated_at: { type: 'integer' },
    },
  },
});

export default createReply;
