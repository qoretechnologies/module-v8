import { Model } from '@google/genai';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GEMINI_APP_NAME, GeminiError } from '../constants';
import { createGeminiClient } from '../helpers/constants';

const action = 'list_models';

const listModels = QoreAppCreator.createLocalizedAction({
  app: GEMINI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GeminiError,
    });

    const client = createGeminiClient(token);

    try {
      const asyncIterable = await client.models.list();

      const models: Model[] = [];
      for await (const m of asyncIterable) {
        models.push(m);
      }

      return models.map((model) => ({
        ...model,
        id: model.name!.replace('models/', ''),
      }));
    } catch (error) {
      throw new GeminiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        description: { type: 'string' },
        version: { type: 'string' },
        inputTokenLimit: { type: 'number' },
        outputTokenLimit: { type: 'number' },
        supportedActions: {
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
