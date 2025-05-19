import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from '../helpers/constants';
import { getGoogleFormIdAllowedValues } from '../helpers/get-form-id-allowed-values';
import { mapGoogleFormsQuestions } from '../helpers/map-form-questions.helper';
import { forms_v1 } from '@googleapis/forms';

const GoogleFormsNewResponseTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'new_form_response',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    form_id: {
      type: 'string',
      required: true,
      get_allowed_values: getGoogleFormIdAllowedValues,
    },
    include_questions: {
      type: 'boolean',
      required: false,
      default_value: false,
    },
    include_answers: {
      type: 'boolean',
      required: false,
      default_value: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { form_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['form_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const include_questions = context.opts?.include_questions === true;
    const include_answers = context.opts?.include_answers === true;

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const formsClient = createGoogleFormsClient(token);
    const formResponse = await formsClient.forms.get({
      formId: form_id,
      fields: '*',
    });

    const getItems = () => {
      return fetchLatestResponses({
        token,
        formId: form_id,
        includeQuestions: include_questions,
        includeAnswers: include_answers,
        since: lastPollTime,
        form: formResponse.data,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_forms_new_form_response',
      uniqueField: 'response_id',
      getItems,
      updateLastPollTime,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { form_id, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['form_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const include_questions = context.opts?.include_questions === true;
    const include_answers = context.opts?.include_answers === true;
    const formsClient = createGoogleFormsClient(token);
    const formResponse = await formsClient.forms.get({
      formId: form_id,
      fields: '*',
    });
    const responses = await fetchLatestResponses({
      token,
      formId: form_id,
      includeAnswers: include_answers,
      includeQuestions: include_questions,
      form: formResponse.data,
    });

    return responses?.length > 0 ? responses[0] : null;
  },
  event_info: {
    desc: 'Google Forms New Response Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        response_id: { type: 'string' },
        form_id: { type: 'string' },
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
        form_title: { type: 'string' },
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
              },
            },
          },
        },
      },
    },
  },
});

export default GoogleFormsNewResponseTrigger;

const fetchLatestResponses = async (options: {
  token: string;
  formId: string;
  form: forms_v1.Schema$Form;
  includeQuestions?: boolean;
  includeAnswers?: boolean;
  since?: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  console.log('Since:', options.since);

  const { token, formId, form, includeQuestions = false, includeAnswers = true, since } = options;

  try {
    const formsClient = createGoogleFormsClient(token);

    let formQuestions: any[] = [];
    const formTitle = form.info?.title || 'Untitled Form';

    if (form.items && form.items.length > 0) {
      formQuestions = mapGoogleFormsQuestions(form);
    }

    const responsesResult = await formsClient.forms.responses.list({
      formId,
      pageSize: limit,
      ...(since && { filter: `timestamp >= ${since}` }),
    });

    const responses = responsesResult.data.responses || [];

    if (responses.length === 0) {
      return [];
    }

    const questionsMap = formQuestions.reduce((map, question) => {
      map[question.id] = question;

      return map;
    }, {});

    return responses.map((response) => {
      let answers: Record<string, any> = [];

      if (includeAnswers) {
        answers = response.answers
          ? Object.entries(response.answers).map(([questionId, answer]) => {
              const questionInfo = questionsMap[questionId] || {
                title: 'Unknown Question',
                type: 'UNKNOWN',
              };

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

      const processedResponse: Record<string, any> = {
        response_id: response.responseId || '',
        form_id: formId,
        form_title: formTitle,
        isQuiz: form.settings?.quizSettings?.isQuiz || false,
        timestamp: response.createTime || '',
        respondent_email: response.respondentEmail || '',
        last_submitted_time: response.lastSubmittedTime || '',
      };

      if (includeQuestions) processedResponse.questions = formQuestions;
      if (includeAnswers) processedResponse.answers = answers;

      return processedResponse;
    });
  } catch (error) {
    throw new GoogleFormsError(`Failed to fetch latest responses: ${error.message || error}`);
  }
};
