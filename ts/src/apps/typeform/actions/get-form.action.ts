import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractTypeformErrorMessage, TYPEFORM_APP_NAME, TypeformError } from '../constants';
import { getTypeformFormIdAllowedValues } from '../helpers/get-form-allowed-values';

const options = {
  form_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTypeformFormIdAllowedValues,
  },
} satisfies TQoreOptions;

const getForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'get_form',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['form_id'],
      ErrorClass: TypeformError,
    });

    try {
      const client = createClient({ token });

      const response = await client.forms.get({
        uid: form_id,
      });

      return response;
    } catch (error) {
      throw new TypeformError(`Failed to get form: ${extractTypeformErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' },
      workspace: {
        type: {
          type: 'hash',
          fields: {
            href: { type: 'string' },
          },
        },
      },
      theme: {
        type: {
          type: 'hash',
          fields: {
            href: { type: 'string' },
          },
        },
      },
      settings: {
        type: {
          type: 'hash',
          fields: {
            language: { type: 'string' },
            progress_bar: { type: 'string' },
            meta: {
              type: {
                type: 'hash',
                fields: {
                  allow_indexing: { type: 'bool' },
                },
              },
            },
            hide_navigation: { type: 'bool' },
            is_public: { type: 'bool' },
            is_trial: { type: 'bool' },
            show_progress_bar: { type: 'bool' },
            show_typeform_branding: { type: 'bool' },
            are_uploads_public: { type: 'bool' },
            show_time_to_complete: { type: 'bool' },
            show_number_of_submissions: { type: 'bool' },
            show_cookie_consent: { type: 'bool' },
            show_question_number: { type: 'bool' },
            show_key_hint_on_choices: { type: 'bool' },
            autosave_progress: { type: 'bool' },
            free_form_navigation: { type: 'bool' },
            use_lead_qualification: { type: 'bool' },
            pro_subdomain_enabled: { type: 'bool' },
            auto_translate: { type: 'bool' },
            partial_responses_to_all_integrations: { type: 'bool' },
          },
        },
      },
      thankyou_screens: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              ref: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              properties: {
                type: {
                  type: 'hash',
                  fields: {
                    show_button: { type: 'bool' },
                    share_icons: { type: 'bool' },
                    button_mode: { type: 'string' },
                    button_text: { type: 'string' },
                  },
                },
              },
              attachment: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    href: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      fields: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              title: { type: 'string' },
              ref: { type: 'string' },
              type: { type: 'string' },
              properties: {
                type: {
                  type: 'hash',
                  fields: {
                    randomize: { type: 'bool' },
                    allow_multiple_selection: { type: 'bool' },
                    allow_other_choice: { type: 'bool' },
                    vertical_alignment: { type: 'bool' },
                    choices: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            ref: { type: 'string' },
                            label: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              validations: {
                type: {
                  type: 'hash',
                  fields: {
                    required: { type: 'bool' },
                  },
                },
              },
            },
          },
        },
      },
      created_at: { type: 'string' },
      last_updated_at: { type: 'string' },
      _links: {
        type: {
          type: 'hash',
          fields: {
            display: { type: 'string' },
            responses: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getForm;
