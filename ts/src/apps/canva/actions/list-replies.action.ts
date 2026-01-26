import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';
import { getCanvaDesignAllowedValues } from '../helpers/get-design-allowed-values';

const action = 'list_replies';

const options = {
  limit: { type: 'number', required: false, default_value: 50 },
  continuation: { type: 'string', required: false },
  design: {
    type: 'string',
    required: true,
    get_allowed_values: getCanvaDesignAllowedValues,
  },
  thread: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const listReplies = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, design, thread } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['design', 'thread'],
      ErrorClass: CanvaError,
    });

    const { continuation, limit = 50 } = obj || {};

    try {
      const response = await canvaApiClient({
        path: `designs/${design}/comments/${thread}/replies`,
        method: 'GET',
        params: {
          ...(continuation && { continuation }),
          ...(limit && { limit: limit.toString() }),
        },
        token,
      });

      return response;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      continuation: { type: 'string' },
      items: {
        type: {
          type: 'list',
          element_type: {
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
        },
      },
    },
  },
});

export default listReplies;
