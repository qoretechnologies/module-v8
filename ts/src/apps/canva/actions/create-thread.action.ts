import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';
import { getCanvaDesignAllowedValues } from '../helpers/get-design-allowed-values';

const action = 'create_thread';

const options = {
  design: {
    type: 'string',
    required: true,
    get_allowed_values: getCanvaDesignAllowedValues,
  },
  message: {
    type: 'string',
    required: true,
  },
  assignee: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const createThread = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, message, design } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['message', 'design'],
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    const assignee = obj?.assignee;

    try {
      const res = await canvaApiClient<{ thread: Record<string, any> }>({
        path: `designs/${design}/comments`,
        method: 'POST',
        token,
        body: {
          message_plaintext: message,
          ...(assignee && { assignee_id: assignee }),
        },
      });

      return res.thread;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      design_id: { type: 'string' },
      thread_type: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
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
            assignee: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  display_name: { type: 'string' },
                },
              },
            },
            resolver: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  display_name: { type: 'string' },
                },
              },
            },
          },
        },
      },
      author: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            display_name: { type: 'string' },
          },
        },
      },
      created_at: { type: 'integer' },
      updated_at: { type: 'integer' },
    },
  },
});

export default createThread;
