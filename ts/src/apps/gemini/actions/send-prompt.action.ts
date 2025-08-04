import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GEMINI_APP_NAME, GeminiError } from '../constants';
import { createGeminiClient } from '../helpers/constants';
import { getGeminiFileAllowedValues } from '../helpers/get-file-allowed-values';
import { getGeminiModelAllowedValues } from '../helpers/get-model-allowed-values';

const action = 'send_message';

const options = {
  model: {
    type: 'string',
    required: true,
    get_allowed_values: getGeminiModelAllowedValues,
  },
  prompt: {
    type: 'string',
    required: true,
  },
  system: {
    type: 'string',
    required: false,
    preselected: true,
  },
  maxOutputTokens: {
    type: 'number',
    required: false,
    preselected: true,
    default_value: 1000,
  },
  temperature: {
    type: 'number',
    required: false,
  },
  files: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getGeminiFileAllowedValues,
  },
  topK: {
    type: 'number',
    required: false,
  },
  topP: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const sendPrompt = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GEMINI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, model, prompt } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'prompt'],
      ErrorClass: GeminiError,
    });

    const client = createGeminiClient(token);

    const { maxOutputTokens = 1000, system, temperature, topK, topP, files } = obj || {};

    try {
      let filesData: Array<Record<string, any>> = [];

      if (files?.length) {
        filesData = await Promise.all(
          files.map((file) =>
            client.files.get({
              name: file,
            })
          )
        );
      }

      const response = await client.models.generateContent({
        model,
        contents: [
          {
            text: prompt,
          },
          ...(filesData?.length
            ? filesData.map((file) => ({
                fileData: {
                  mimeType: file.mimeType,
                  fileUri: file.uri,
                },
              }))
            : []),
        ],
        config: {
          maxOutputTokens,
          ...(system && { systemInstruction: system }),
          ...(temperature !== undefined && { temperature }),
          ...(topK !== undefined && { topK }),
          ...(topP !== undefined && { topP }),
        },
      });

      return {
        ...omit(response, 'sdkHttpResponse'),
        text_response: response?.candidates?.[0].content?.parts?.[0].text,
      };
    } catch (error) {
      throw new GeminiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      text_response: { type: 'string' },
      id: { type: 'string' },
      type: { type: 'string' },
      role: { type: 'string' },
      model: { type: 'string' },
      content: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              text: { type: 'string' },
            },
          },
        },
      },
      stop_reason: { type: 'string' },
      stop_sequence: { type: 'string' },
      usage: {
        type: {
          type: 'hash',
          fields: {
            input_tokens: { type: 'integer' },
            cache_creation_input_tokens: { type: 'integer' },
            cache_read_input_tokens: { type: 'integer' },
            output_tokens: { type: 'integer' },
            service_tier: { type: 'string' },
          },
        },
      },
    },
  },
});

export default sendPrompt;
