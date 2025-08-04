import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { OPEN_ROUTER_APP_NAME, OpenRouterError } from '../constants';
import { openRouterApiClient } from '../helpers/constants';

const action = 'list_models';

const options = {
  category: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listModels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: OPEN_ROUTER_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: OpenRouterError,
    });

    try {
      const models = await openRouterApiClient({
        method: 'GET',
        token,
        path: 'models',
        object: 'data',
      });

      return models;
    } catch (error) {
      throw new OpenRouterError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        canonical_slug: { type: 'string' },
        hugging_face_id: { type: 'string' },
        name: { type: 'string' },
        created: { type: 'integer' },
        description: { type: 'string' },
        context_length: { type: 'integer' },
        architecture: {
          type: {
            type: 'hash',
            fields: {
              modality: { type: 'string' },
              input_modalities: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              output_modalities: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              tokenizer: { type: 'string' },
              instruct_type: { type: 'string' },
            },
          },
        },
        pricing: {
          type: {
            type: 'hash',
            fields: {
              prompt: { type: 'string' },
              completion: { type: 'string' },
              request: { type: 'string' },
              image: { type: 'string' },
              audio: { type: 'string' },
              web_search: { type: 'string' },
              internal_reasoning: { type: 'string' },
            },
          },
        },
        top_provider: {
          type: {
            type: 'hash',
            fields: {
              context_length: { type: 'integer' },
              max_completion_tokens: { type: 'integer' },
              is_moderated: { type: 'boolean' },
            },
          },
        },
        per_request_limits: { type: 'hash' },
        supported_parameters: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
      },
    },
  },
});

export default listModels;
