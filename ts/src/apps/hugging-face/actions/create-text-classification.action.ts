import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HUGGING_FACE_APP_NAME, HuggingFaceError } from '../constants';
import { huggingFaceApiClient } from '../helpers/constants';
import { getHuggingFaceTextClassificationModelAllowedValues } from '../helpers/get-model-allowed-values';

const action = 'create_text_classification';

const options = {
  model: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getHuggingFaceTextClassificationModelAllowedValues,
  },
  text: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const createTextClassification = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HUGGING_FACE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, model, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'text'],
      ErrorClass: HuggingFaceError,
    });

    try {
      const response = await huggingFaceApiClient<Array<{ label: string; score: number }>>({
        token,
        path: `/models/${model}`,
        method: 'POST',
        body: { inputs: text },
      });

      return response[0] || {};
    } catch (error) {
      throw new HuggingFaceError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        label: { type: 'string' },
        score: { type: 'float' },
      },
    },
  },
});

export default createTextClassification;
