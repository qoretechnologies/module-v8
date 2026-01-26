import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { OPEN_ROUTER_APP_NAME, OpenRouterError } from '../constants';
import { openRouterApiClient } from '../helpers/constants';
import { getOpenRouterModelAllowedValues } from '../helpers/get-model-allowed-values';

const action = 'send_prompt';

const options = {
  model: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getOpenRouterModelAllowedValues,
  },
  prompt: {
    type: 'string',
    required: true,
  },
  temperature: {
    type: 'number',
    required: false,
  },
  max_tokens: {
    type: 'integer',
    required: false,
  },
  seed: {
    type: 'integer',
    required: false,
  },
  top_p: {
    type: 'number',
    required: false,
  },
  top_k: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const sendPrompt = QoreAppCreator.createLocalizedAction<typeof options>({
  app: OPEN_ROUTER_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, model, prompt } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'prompt'],
      ErrorClass: OpenRouterError,
    });

    const { temperature, max_tokens, seed, top_p, top_k } = obj || {};

    try {
      const response = await openRouterApiClient<{
        choices: Array<{ text: string }>;
      }>({
        method: 'POST',
        token,
        path: 'completions',
        body: {
          model,
          prompt,
          ...(temperature !== undefined && { temperature }),
          ...(max_tokens !== undefined && { max_tokens }),
          ...(seed !== undefined && { seed }),
          ...(top_p !== undefined && { top_p }),
          ...(top_k !== undefined && { top_k }),
        },
      });

      return { ...response, text_response: response?.choices?.[0]?.text };
    } catch (error) {
      throw new OpenRouterError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      provider: { type: 'string' },
      model: { type: 'string' },
      object: { type: 'string' },
      created: { type: 'integer' },
      choices: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              logprobs: { type: 'hash' },
              finish_reason: { type: 'string' },
              native_finish_reason: { type: 'string' },
              text: { type: 'string' },
              reasoning: { type: 'string' },
            },
          },
        },
      },
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
      text_response: { type: 'string' },
    },
  },
});

export default sendPrompt;
