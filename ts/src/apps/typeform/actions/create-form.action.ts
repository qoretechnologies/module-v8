import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { createClient, Typeform } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractTypeformErrorMessage, TYPEFORM_APP_NAME, TypeformError } from '../constants';
import {
  TypeformFieldFormAllowedValues,
  TypeformFieldTypeAllowedValues,
  TypeformFilterOperatorAllowedValues,
  TypeformLanguageAllowedValues,
  TypeformPaymentCurrencyAllowedValues,
} from '../helpers/get-form-field-type-allowed-values';

const AttachmentType = {
  type: {
    type: 'hash',
    fields: {
      type: {
        type: 'string',
        allowed_values: [
          { value: 'image', display_name: 'Image' },
          { value: 'video', display_name: 'Video' },
        ],
      },
      href: { type: 'string' },
      scale: {
        type: 'number',
        allowed_values: [
          { value: 0.4, display_name: '0.4' },
          { value: 0.6, display_name: '0.6' },
          { value: 0.8, display_name: '0.8' },
          { value: 1, display_name: '1' },
        ],
      },
    },
  },
} satisfies TQoreAppActionOption;

const LayoutType = {
  type: {
    type: 'hash',
    fields: {
      type: {
        type: 'string',
        allowed_values: [
          { value: 'split', display_name: 'Split' },
          { value: 'wallpaper', display_name: 'Wallpaper' },
          { value: 'float', display_name: 'Float' },
          { value: 'stack', display_name: 'Stack' },
        ],
      },
      placement: {
        type: 'string',
        allowed_values: [
          { value: 'left', display_name: 'Left' },
          { value: 'right', display_name: 'Right' },
        ],
      },
      attachment: AttachmentType,
    },
  },
} satisfies TQoreAppActionOption;

const options = {
  title: {
    type: 'string',
    required: true,
  },
  fields: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ref: {
            type: 'string',
            required: false,
          },
          title: {
            type: 'string',
            required: true,
          },
          type: {
            type: 'string',
            allowed_values: TypeformFieldTypeAllowedValues,
            required: true,
          },
          properties: {
            type: {
              type: 'hash',
              fields: {
                description: {
                  type: 'string',
                },
                choices: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {
                        ref: { type: 'string' },
                        label: { type: 'string' },
                        attachment: {
                          type: {
                            type: 'hash',
                            fields: {
                              type: { type: 'string', default_value: 'image' },
                              href: { type: 'string' },
                              properties: {
                                type: {
                                  type: 'hash',
                                  fields: {
                                    description: { type: 'string' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                allow_multiple_selection: { type: 'boolean' },
                randomize: { type: 'boolean' },
                allow_other_choice: { type: 'boolean' },
                vertical_alignment: { type: 'boolean' },
                supersized: { type: 'boolean' },
                show_labels: { type: 'boolean' },
                alphabetical_order: { type: 'boolean' },
                hide_marks: { type: 'boolean' },
                button_text: { type: 'string', default_value: 'Continue' },
                start_at_one: { type: 'boolean' },
                structure: {
                  type: 'string',
                  allowed_values: [
                    {
                      value: 'MMDDYYYY',
                      display_name: 'MMDDYYYY',
                    },
                    {
                      value: 'DDMMYYYY',
                      display_name: 'DDMMYYYY',
                    },
                    {
                      value: 'YYYYMMDD',
                      display_name: 'YYYYMMDD',
                    },
                  ],
                },
                separator: {
                  type: 'string',
                  allowed_values: [
                    {
                      value: '/',
                      display_name: '/',
                    },
                    {
                      value: '-',
                      display_name: '-',
                    },
                    {
                      value: '.',
                      display_name: '.',
                    },
                  ],
                },
                currency: {
                  type: 'string',
                  allowed_values: TypeformPaymentCurrencyAllowedValues,
                  allowed_values_creatable: true,
                },
                price: {
                  type: {
                    type: 'hash',
                    fields: {
                      type: {
                        type: 'string',
                        default_value: 'variable',
                      },
                      value: {
                        type: 'string',
                        default_value: 'price',
                      },
                    },
                  },
                },
                show_button: { type: 'boolean' },
                default_country_code: {
                  type: 'string',
                  default_value: 'us',
                },
                steps: { type: 'number' },
                shape: { type: 'string', allowed_values: TypeformFieldFormAllowedValues },
                labels: {
                  type: {
                    type: 'hash',
                    fields: {
                      left: { type: 'string' },
                      right: { type: 'string' },
                      center: { type: 'string' },
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
                required: { type: 'boolean' },
                max_length: { type: 'integer' },
                min_value: { type: 'integer' },
                max_value: { type: 'integer' },
                min_selection: { type: 'integer' },
                max_selection: { type: 'integer' },
              },
            },
          },
          attachment: AttachmentType,
          layout: LayoutType,
          scoring: {
            type: {
              type: 'hash',
              fields: {
                type: {
                  required: true,
                  type: 'string',
                  allowed_values: [
                    { value: 'boolean_correct', display_name: 'Boolean Correct' },
                    { value: 'choices_all_correct', display_name: 'Choices All Correct' },
                  ],
                },
                boolean_correct: {
                  type: {
                    type: 'hash',
                    fields: {
                      boolean: { type: 'boolean', required: true },
                      score: { type: 'number', required: true },
                    },
                  },
                },
                choices_all_correct: {
                  type: {
                    type: 'hash',
                    fields: {
                      choices: {
                        type: {
                          type: 'list',
                          element_type: 'string',
                        },
                      },
                      score: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  hidden: {
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  variables: {
    type: {
      type: 'hash',
      fields: {
        score: { type: 'number' },
        price: { type: 'integer' },
      },
    },
  },
  welcome_screens: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ref: { type: 'string' },
          title: { required: true, type: 'string' },
          properties: {
            type: {
              type: 'hash',
              fields: {
                description: { type: 'string' },
                show_button: { type: 'boolean' },
                button_text: { type: 'string' },
              },
            },
          },
          attachment: AttachmentType,
          layout: LayoutType,
        },
      },
    },
  },
  thankyou_screens: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ref: { type: 'string' },
          title: { required: true, type: 'string' },
          properties: {
            type: {
              type: 'hash',
              fields: {
                description: { type: 'string' },
                show_button: { type: 'boolean' },
                button_text: { type: 'string' },
              },
            },
          },
          attachment: AttachmentType,
          layout: LayoutType,
        },
      },
    },
  },
  settings: {
    type: {
      type: 'hash',
      fields: {
        language: { type: 'string', allowed_values: TypeformLanguageAllowedValues },
        is_public: { type: 'boolean' },
        autosave_progress: { type: 'boolean' },
        progress_bar: {
          type: 'string',
          allowed_values: [
            { value: 'percentage', display_name: 'Percentage' },
            { value: 'proportion', display_name: 'Proportion' },
          ],
        },
        show_progress_bar: { type: 'boolean' },
        show_typeform_branding: { type: 'boolean' },
        show_time_to_complete: { type: 'boolean' },
        show_number_of_submissions: { type: 'boolean' },
        show_cookie_consent: { type: 'boolean' },
        show_question_number: { type: 'boolean' },
        show_key_hint_on_choices: { type: 'boolean' },
        hide_navigation: { type: 'boolean' },
        redirect_after_submit_url: { type: 'string' },
        google_analytics: { type: 'string' },
        facebook_pixel: { type: 'string' },
        google_tag_manager: { type: 'string' },
        captcha: { type: 'boolean' },
        duplicate_prevention: {
          type: {
            type: 'hash',
            fields: {
              type: {
                type: 'string',
                allowed_values: [
                  { value: 'cookie', display_name: 'Cookie' },
                  { value: 'cookie_ip', display_name: 'Cookie IP' },
                ],
              },
            },
          },
        },
        responses_limit: { type: 'number' },
        period: {
          type: 'string',
          allowed_values: [
            { value: 'day', display_name: 'Day' },
            { value: 'week', display_name: 'Week' },
            { value: 'month', display_name: 'Month' },
            { value: 'year', display_name: 'Year' },
          ],
        },
      },
    },
  },
  logic: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          type: {
            type: 'string',
            allowed_values: [
              { value: 'field', display_name: 'Field' },
              { value: 'hidden', display_name: 'Hidden' },
            ],
          },
          ref: { type: 'string' },
          actions: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  action: {
                    type: 'string',
                    allowed_values: [
                      { value: 'jump', display_name: 'Jump' },
                      { value: 'add', display_name: 'Add' },
                      { value: 'subtract', display_name: 'Subtract' },
                      { value: 'multiply', display_name: 'Multiply' },
                      { value: 'divide', display_name: 'Divide' },
                      { value: 'set', display_name: 'Set' },
                    ],
                  },
                  details: {
                    type: {
                      type: 'hash',
                      fields: {
                        to: {
                          type: {
                            type: 'hash',
                            fields: {
                              type: {
                                required: true,
                                type: 'string',
                                allowed_values: [
                                  { value: 'field', display_name: 'Field' },
                                  { value: 'thankyou', display_name: 'Thank You' },
                                  { value: 'outcome', display_name: 'Outcome' },
                                ],
                              },
                              value: { type: 'string' },
                            },
                          },
                        },
                        target: {
                          type: {
                            type: 'hash',
                            fields: {
                              type: { type: 'string', default_value: 'variable' },
                              value: { type: 'string' },
                            },
                          },
                        },
                        value: {
                          type: {
                            type: 'hash',
                            fields: {
                              type: {
                                type: 'string',
                                allowed_values: [
                                  { value: 'constant', display_name: 'Constant' },
                                  { value: 'variable', display_name: 'Variable' },
                                  { value: 'evaluation', display_name: 'Evaluation' },
                                ],
                              },
                              value: { type: 'any' },
                            },
                          },
                        },
                      },
                    },
                  },
                  condition: {
                    type: {
                      type: 'hash',
                      fields: {
                        op: { type: 'string', allowed_values: TypeformFilterOperatorAllowedValues },
                        vars: {
                          type: {
                            type: 'list',
                            element_type: {
                              type: 'hash',
                              fields: {
                                type: {
                                  type: 'string',
                                  allowed_values: [
                                    { value: 'field', display_name: 'Field' },
                                    { value: 'hidden', display_name: 'Hidden' },
                                    { value: 'variable', display_name: 'Variable' },
                                    { value: 'constant', display_name: 'Constant' },
                                    { value: 'choice', display_name: 'Choice' },
                                  ],
                                },
                                value: {
                                  type: 'any',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreOptions;

const createForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'create_form',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title'],
      ErrorClass: TypeformError,
    });

    const { fields, hidden, variables, welcome_screens, thankyou_screens, logic, settings } =
      obj || {};

    try {
      const client = createClient({ token });

      const data = {
        title,
        ...(fields && { fields: fields as Typeform.Field[] }),
        ...(hidden && { hidden }),
        ...(variables && { variables: variables as Record<string, any> }),
        ...(welcome_screens && { welcome_screens: welcome_screens as Typeform.WelcomeScreen[] }),
        ...(thankyou_screens && {
          thankyou_screens: thankyou_screens as Typeform.ThankYouScreen[],
        }),
        ...(logic && { logic: logic as Typeform.Logic[] }),
        ...(settings && { settings: settings as Typeform.Settings }),
      } satisfies Typeform.Form;

      const response = await client.forms.create({ data });

      return response;
    } catch (error) {
      throw new TypeformError(`Failed to create form: ${extractTypeformErrorMessage(error)}`);
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
                  allow_indexing: { type: 'boolean' },
                },
              },
            },
            hide_navigation: { type: 'boolean' },
            is_public: { type: 'boolean' },
            is_trial: { type: 'boolean' },
            show_progress_bar: { type: 'boolean' },
            show_typeform_branding: { type: 'boolean' },
            are_uploads_public: { type: 'boolean' },
            show_time_to_complete: { type: 'boolean' },
            show_number_of_submissions: { type: 'boolean' },
            show_cookie_consent: { type: 'boolean' },
            show_question_number: { type: 'boolean' },
            show_key_hint_on_choices: { type: 'boolean' },
            autosave_progress: { type: 'boolean' },
            free_form_navigation: { type: 'boolean' },
            use_lead_qualification: { type: 'boolean' },
            pro_subdomain_enabled: { type: 'boolean' },
            auto_translate: { type: 'boolean' },
            partial_responses_to_all_integrations: { type: 'boolean' },
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
                    show_button: { type: 'boolean' },
                    share_icons: { type: 'boolean' },
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
                    randomize: { type: 'boolean' },
                    allow_multiple_selection: { type: 'boolean' },
                    allow_other_choice: { type: 'boolean' },
                    vertical_alignment: { type: 'boolean' },
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
                    required: { type: 'boolean' },
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

export default createForm;
