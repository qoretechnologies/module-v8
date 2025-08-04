import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GEMINI_APP_NAME, GeminiError } from '../constants';
import { createGeminiClient } from '../helpers/constants';
import { PersonGeneration } from '@google/genai';

const action = 'generate_image';

const options = {
  model: {
    type: 'string',
    allowed_values_creatable: true,
    required: true,
    allowed_values: [{ value: 'imagen-3.0-generate-002', display_name: 'Imagen 3.0 Generate' }],
  },
  prompt: {
    type: 'string',
    required: true,
  },
  ratio: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: '1:1', display_name: '1:1' },
      { value: '3:4', display_name: '3:4' },
      { value: '4:3', display_name: '4:3' },
      { value: '16:9', display_name: '16:9' },
      { value: '9:16', display_name: '9:16' },
    ],
  },
  personGeneration: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'ALLOW_ALL', display_name: 'Allow All' },
      { value: 'ALLOW_ADULT', display_name: 'Allow Adult' },
      { value: 'DONT_ALLOW', display_name: `Don't allow` },
    ],
  },
} satisfies TQoreOptions;

const generateImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GEMINI_APP_NAME,
  action,
  options,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, prompt, model } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['prompt', 'model'],
      ErrorClass: GeminiError,
    });

    const { ratio = '1:1' } = obj || {};
    const personGeneration = (obj?.personGeneration || 'ALLOW_ALL') as PersonGeneration;
    const client = createGeminiClient(token);

    try {
      const response = await client.models.generateImages({
        prompt,
        model,
        config: {
          aspectRatio: ratio,
          personGeneration,
        },
      });

      return response;
    } catch (error) {
      throw new GeminiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      generatedImages: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              image: {
                type: {
                  type: 'hash',
                  fields: {
                    imageBytes: {
                      type: 'string',
                    },
                    mimeType: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      model: {
        type: 'string',
      },
      prompt: {
        type: 'string',
      },
      config: {
        type: {
          type: 'hash',
          fields: {
            aspectRatio: {
              type: 'string',
            },
            personGeneration: {
              type: 'string',
            },
          },
        },
      },
      success: {
        type: 'boolean',
      },
      generated_at: {
        type: 'string',
      },
    },
  },
});

export default generateImage;
