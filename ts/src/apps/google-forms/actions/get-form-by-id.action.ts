import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
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
    allowed_values_creatable: true,
    get_allowed_values: getGoogleFormIdAllowedValues,
    preselected: true,
  },
  include_questions: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    form_id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    document_title: { type: 'string' },
    is_accepting_responses: { type: 'boolean' },
    is_published: { type: 'boolean' },
    linked_sheet_id: { type: 'string' },
    edit_url: { type: 'string' },
    view_url: { type: 'string' },
    settings: {
      type: {
        type: 'hash',
        fields: {
          email_collection: { type: 'string' },
          is_quiz: { type: 'boolean' },
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
    responses_error: { type: 'string' },
  },
} satisfies TQoreResponseType;

const getForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'get_form',
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

    const include_questions = obj?.include_questions === true;

    try {
      const formsClient = createGoogleFormsClient(token);

      const formResponse = await formsClient.forms.get({
        formId: form_id,
      });

      const form = formResponse.data;
      if (!form) {
        throw new GoogleFormsError(`Form with ID ${form_id} not found`);
      }

      const result: Partial<TQoreMappedOptions<(typeof response_type)['fields']>> = {
        form_id: form.formId || '',
        title: form.info?.title || '',
        description: form.info?.description || '',
        document_title: form.info?.documentTitle || '',
        is_accepting_responses: form.publishSettings?.publishState?.isAcceptingResponses || false,
        is_published: form.publishSettings?.publishState?.isPublished || false,
        linked_sheet_id: form.linkedSheetId || undefined,
        edit_url: `https://docs.google.com/forms/d/${form_id}/edit`,
        view_url: form.responderUri || undefined,
        settings: {
          email_collection: form.settings?.emailCollectionType || 'DO_NOT_COLLECT',
          is_quiz: form.settings?.quizSettings?.isQuiz || false,
        },
      };

      if (include_questions && form.items && form.items.length > 0) {
        result.questions = mapGoogleFormsQuestions(form);
      }

      return result;
    } catch (error: any) {
      throw new GoogleFormsError(`Failed to retrieve Google Form: ${error.message || error}`);
    }
  },
  response_type,
});

export default getForm;
