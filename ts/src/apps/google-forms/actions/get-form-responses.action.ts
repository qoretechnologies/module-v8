import { forms_v1 } from '@googleapis/forms';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from '../helpers/constants';
import { getGoogleFormIdAllowedValues } from '../helpers/get-form-id-allowed-values';
import { mapGoogleFormsQuestions } from '../helpers/map-form-questions.helper';

const options = {
  form_id: {
    required: true,
    type: 'string',
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleFormIdAllowedValues,
  },
  limit: {
    required: false,
    type: 'number',
    default_value: 50,
  },
  page_token: {
    required: false,
    type: 'string',
  },
  respondent_email: {
    required: false,
    type: 'string',
  },
  filter_answers: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          question_id: {
            type: 'string',
            required: true,
          },
          filter_type: {
            type: 'string',
            required: false,
            default_value: 'contains',
            allowed_values: [
              {
                display_name: 'Contains',
                value: 'contains',
              },
              {
                display_name: 'Equals',
                value: 'equals',
              },
            ],
          },
          value: {
            type: 'string',
            required: true,
          },
        },
      },
    },
  },
  include_questions: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  include_answers: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    form_id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    document_title: { type: 'string' },
    responder_uri: { type: 'string' },
    is_quiz: { type: 'boolean' },
    responses: {
      type: {
        type: 'list',
        element_type: {
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
    count: { type: 'number' },
    next_page_token: { type: 'string' },
    has_more: { type: 'boolean' },
  },
} satisfies TQoreResponseType;

const getFormResponses = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'get_form_responses',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id } = getQoreContextRequiredValues<{
      token: string;
      form_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['form_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const limit = Math.min(obj?.limit || 50, 5000);
    const page_token = obj?.page_token || undefined;
    const respondent_email = obj?.respondent_email || undefined;
    const filter_answers = obj?.filter_answers || [];
    const include_questions = obj?.include_questions === true;
    const include_answers = obj?.include_answers === true;

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

      if (
        (include_answers || include_questions) &&
        formResponse.data.items &&
        formResponse.data.items.length > 0
      ) {
        formQuestions = mapGoogleFormsQuestions(formResponse.data);
      }

      const params: forms_v1.Params$Resource$Forms$Responses$List = {
        formId: form_id,
        pageSize: limit,
        pageToken: page_token,
      };

      const responsesResult = await formsClient.forms.responses.list(params);

      const questionsMap = formQuestions.reduce((map, question) => {
        map[question.id] = question;

        return map;
      }, {});

      let responses = responsesResult.data.responses || [];

      if (respondent_email) {
        responses = responses.filter(
          (response) =>
            response.respondentEmail &&
            response.respondentEmail.toLowerCase().includes(respondent_email.toLowerCase())
        );
      }

      if (filter_answers.length > 0) {
        for (const filter_answer of filter_answers) {
          if (filter_answer?.question_id && filter_answer?.value) {
            const filterType = filter_answer.filter_type || 'contains';

            responses = responses.filter((response) => {
              if (!response.answers || !response.answers[filter_answer.question_id]) {
                return false;
              }

              const answer = response.answers[filter_answer.question_id];
              const textAnswers = answer.textAnswers?.answers || [];

              if (filterType === 'equals') {
                return textAnswers.some(
                  (textAnswer) =>
                    textAnswer.value &&
                    textAnswer.value.toLowerCase() === filter_answer.value.toLowerCase()
                );
              } else if (filterType === 'contains') {
                return textAnswers.some(
                  (textAnswer) =>
                    textAnswer.value &&
                    textAnswer.value.toLowerCase().includes(filter_answer.value.toLowerCase())
                );
              }
            });
          }
        }
      }

      const processedResponses = responses.map((response) => {
        let answers: Record<string, any>[] = [];

        if (include_answers) {
          answers = response.answers
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
        }

        return {
          response_id: response.responseId || '',
          timestamp: response.createTime || '',
          respondent_email: response.respondentEmail || '',
          last_submitted_time: response.lastSubmittedTime || '',
          ...(include_answers && { answers }),
        };
      });

      return {
        form_id,
        ...(include_questions ? formInfo : {}),
        responses: processedResponses,
        count: processedResponses.length,
        next_page_token: responsesResult.data.nextPageToken || null,
        has_more: !!responsesResult.data.nextPageToken,
        ...(include_questions ? { questions: formQuestions } : {}),
      };
    } catch (error: any) {
      throw new GoogleFormsError(`Failed to retrieve form responses: ${error.message || error}`);
    }
  },
  response_type,
});

export default getFormResponses;
