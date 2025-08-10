import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HUGGING_FACE_APP_NAME, HuggingFaceError } from '../constants';
import { huggingFaceApiClient } from '../helpers/constants';
import {
  getHuggingFaceDocumentQuestionAnsweringModelAllowedValues,
  getHuggingFaceQuestionAnsweringModelAllowedValues,
  getHuggingFaceVisualQuestionAnsweringModelAllowedValues,
} from '../helpers/get-model-allowed-values';

const action = 'answer_question_based_on_context';

const contextOptions = {
  context: {
    type: 'string',
    required: true,
    desc: 'Text context to answer the question from',
  },
} satisfies TQoreOptions;

const documentOptions = {
  file: {
    type: 'file',
    required: true,
    desc: 'Document context to answer the question from',
  },
} satisfies TQoreOptions;

const imageOptions = {
  image: {
    type: 'file',
    required: true,
    desc: 'Image context to answer the question from',
  },
} satisfies TQoreOptions;

const options = {
  type: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    allowed_values: [
      { value: 'question-answering', display_name: 'Question Answering based on text context' },
      {
        value: 'document-question-answering',
        display_name: 'Question Answering based on document context',
      },
      { value: 'visual-question-answering', display_name: 'Visual Question Answering' },
    ],
    get_dependent_options: (context) => {
      const { type } = getQoreContextRequiredValues({
        context,
        optionFields: ['type'],
        ErrorClass: HuggingFaceError,
      });

      if (type === 'question-answering') {
        return contextOptions;
      } else if (type === 'document-question-answering') {
        return documentOptions;
      } else if (type === 'visual-question-answering') {
        return imageOptions;
      }

      return {};
    },
  },
  model: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    depends_on: ['type'],
    get_allowed_values: (context) => {
      const { type } = getQoreContextRequiredValues({
        context,
        optionFields: ['type'],
        ErrorClass: HuggingFaceError,
      });

      if (type === 'question-answering') {
        return getHuggingFaceQuestionAnsweringModelAllowedValues(context);
      } else if (type === 'document-question-answering') {
        return getHuggingFaceDocumentQuestionAnsweringModelAllowedValues(context);
      } else if (type === 'visual-question-answering') {
        return getHuggingFaceVisualQuestionAnsweringModelAllowedValues(context);
      }

      return [];
    },
  },
  question: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const answerQuestionBasedOnContext = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof documentOptions & typeof imageOptions & typeof contextOptions>
>({
  app: HUGGING_FACE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, model, type, question } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['model', 'type', 'question'],
      ErrorClass: HuggingFaceError,
    });

    const { context: questionContext, image, file } = obj || {};

    try {
      return await huggingFaceApiClient({
        token,
        path: `/models/${model}`,
        method: 'POST',
        body:
          type === 'question-answering'
            ? {
                inputs: { question, context: questionContext },
              }
            : {
                inputs: { question, image: image?.content || file?.content },
              },
      });
    } catch (error) {
      throw new HuggingFaceError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      score: { type: 'number' },
      start: { type: 'number' },
      end: { type: 'number' },
      answer: { type: 'string' },
    },
  },
});

export default answerQuestionBasedOnContext;
