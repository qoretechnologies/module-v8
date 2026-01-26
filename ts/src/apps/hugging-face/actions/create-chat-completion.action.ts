import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HUGGING_FACE_APP_NAME, HuggingFaceError } from '../constants';
import { huggingFaceApiClient } from '../helpers/constants';
import { getHuggingFaceChatCompletionModelAllowedValues } from '../helpers/get-model-allowed-values';

const action = 'create_chat_completion';

const options = {
  model: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getHuggingFaceChatCompletionModelAllowedValues,
  },
  messages: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          role: {
            type: 'string',
            required: true,
            allowed_values: [
              { value: 'user', display_name: 'User' },
              { value: 'assistant', display_name: 'Assistant' },
            ],
          },
          content: {
            type: 'string',
            required: true,
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const createChatCompletion = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HUGGING_FACE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, model } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'messages'],
      ErrorClass: HuggingFaceError,
    });

    const messages = obj?.messages || [];

    try {
      const response = await huggingFaceApiClient<{
        choices: {
          message: { content: string };
        }[];
      }>({
        token,
        url: 'https://router.huggingface.co',
        path: `/v1/chat/completions`,
        method: 'POST',
        body: {
          model,
          messages,
        },
      });

      return { ...response, text_response: response.choices[0]?.message?.content || '' };
    } catch (error) {
      throw new HuggingFaceError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      text_response: { type: 'string' },
      id: { type: 'string' },
      object: { type: 'string' },
      created: { type: 'integer' },
      model: { type: 'string' },
      choices: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              index: { type: 'integer' },
              message: {
                type: {
                  type: 'hash',
                  fields: {
                    role: { type: 'string' },
                    content: { type: 'string' },
                  },
                },
              },
              finish_reason: { type: 'string' },
            },
          },
        },
      },
      system_fingerprint: { type: 'string' },
      usage: {
        type: {
          type: 'hash',
          fields: {
            prompt_tokens: { type: 'integer' },
            completion_tokens: { type: 'integer' },
            total_tokens: { type: 'integer' },
          },
        },
      },
    },
  },
});

export default createChatCompletion;
