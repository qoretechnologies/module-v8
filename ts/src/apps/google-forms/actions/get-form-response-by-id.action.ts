import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from '../helpers/constants';
import { getGoogleFormIdAllowedValues } from '../helpers/get-form-id-allowed-values';
import { mapGoogleFormsQuestions } from '../helpers/map-form-questions.helper';
import { getGoogleFormResponseIdAllowedValues } from '../helpers/get-response-id-allowed-values';

const options = {
  form_id: {
    required: true,
    type: 'string',
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleFormIdAllowedValues,
    on_change: ['refetch'],
  },
  response_id: {
    required: true,
    type: 'string',
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleFormResponseIdAllowedValues,
    depends_on: ['form_id'],
  },
  include_questions: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const getFormResponse = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'get_form_response',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id, response_id } = getQoreContextRequiredValues<{
      token: string;
      form_id: string;
      response_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['form_id', 'response_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const include_questions = obj?.include_questions ?? false;

    try {
      const formsClient = createGoogleFormsClient(token);

      let formQuestions: any[] = [];
      let formInfo = {};

      const formResponse = await formsClient.forms.get({
        formId: form_id,
        fields: '*',
      });

      formInfo = {
        title: formResponse.data.info?.title || '',
        description: formResponse.data.info?.description || '',
        document_title: formResponse.data.info?.documentTitle || '',
        responder_uri: formResponse.data.responderUri || '',
        is_quiz: formResponse.data.settings?.quizSettings?.isQuiz || false,
      };

      if (formResponse.data.items && formResponse.data.items.length > 0) {
        formQuestions = mapGoogleFormsQuestions(formResponse.data);
      }

      const responseResult = await formsClient.forms.responses.get({
        formId: form_id,
        responseId: response_id,
      });

      const response = responseResult.data;

      if (!response) {
        throw new GoogleFormsError(`Response with ID ${response_id} not found`);
      }

      const questionsMap = formQuestions.reduce((map, question) => {
        map[question.id] = question;

        return map;
      }, {});

      const answers = response.answers
        ? Object.entries(response.answers).map(([questionId, answer]) => {
            const questionInfo = questionsMap[questionId] || { title: 'Unknown Question' };

            return {
              question_id: questionId,
              question_title: questionInfo.title || 'Unknown Question',
              question_type: questionInfo.type || 'UNKNOWN',
              text_value: answer.textAnswers?.answers?.map((a) => a.value).join(', ') || '',
              grade: answer.grade?.score ?? null,
              correct_answer: answer.grade?.correct || false,
              feedback: answer.grade?.feedback?.text ?? null,
            };
          })
        : [];

      const processedResponse = {
        response_id: response.responseId || '',
        timestamp: response.createTime || '',
        respondent_email: response.respondentEmail || 'No Email',
        last_submitted_time: response.lastSubmittedTime || '',
        answers,
      };

      return {
        form_id,
        ...formInfo,
        ...(include_questions ? { questions: formQuestions } : {}),
        response: processedResponse,
      };
    } catch (error: any) {
      throw new GoogleFormsError(`Failed to retrieve form response: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      form_id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      document_title: { type: 'string' },
      responder_uri: { type: 'string' },
      is_quiz: { type: 'boolean' },
      response: {
        type: {
          type: 'hash',
          fields: {
            response_id: { type: 'string' },
            timestamp: { type: 'string' },
            respondent_email: { type: 'string' },
            last_submitted_time: { type: 'string' },
            answers: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    question_id: { type: 'string' },
                    question_title: { type: 'string' },
                    question_type: { type: 'string' },
                    text_value: { type: 'string' },
                    grade: { type: 'number' },
                    correct_answer: { type: 'boolean' },
                    feedback: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      questions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              help_text: { type: 'string' },
              required: { type: 'boolean' },
              choices: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              scale_min: { type: 'number' },
              scale_max: { type: 'number' },
              scale_min_label: { type: 'string' },
              scale_max_label: { type: 'string' },
              correct_answer: { type: 'string' },
              points: { type: 'number' },
              feedback: { type: 'string' },
              shuffle_choices: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
});

export default getFormResponse;
