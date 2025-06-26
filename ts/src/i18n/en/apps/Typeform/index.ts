/* eslint-disable max-len */
const TypeformAppEn = {
  displayName: 'Typeform',
  shortDesc: 'Create and manage interactive forms, surveys, and quizzes with Typeform.',
  longDesc:
    'Typeform is a versatile form builder that allows you to create engaging, conversational forms, surveys, quizzes, and polls. With its intuitive interface and powerful features, you can collect responses, analyze data, and integrate with other tools to streamline your workflow. Perfect for lead generation, customer feedback, event registration, and market research.',
  triggers: {
    new_form_response: {
      displayName: 'New Form Response',
      shortDesc: 'Triggers when a new response is submitted to a Typeform form.',
      longDesc:
        'This trigger activates whenever someone submits a response to your Typeform. It provides complete response data including all answers, form definition, calculated scores, and metadata. Perfect for processing form submissions, updating databases, sending notifications, or triggering follow-up workflows based on user responses.',
      options: {
        form_id: {
          displayName: 'Form',
          shortDesc: 'The Typeform to monitor for new responses',
          longDesc:
            'Select the specific Typeform that you want to monitor for new submissions. The trigger will fire every time someone completes and submits this form.',
        },
      },
    },
  },
  actions: {
    list_workspaces: {
      displayName: 'List Workspaces',
      shortDesc: 'Retrieve a list of workspaces in your Typeform account.',
      longDesc:
        'Fetches all workspaces available in your Typeform account with pagination and search capabilities. Workspaces help organize your forms and collaborate with team members. Use this to get workspace information including form counts and sharing status.',
      options: {
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter workspaces by name',
          longDesc:
            'Optional search term to filter workspaces by their name. Leave empty to retrieve all workspaces.',
        },
        page: {
          displayName: 'Page',
          shortDesc: 'Page number for pagination',
          longDesc:
            'The page number to retrieve. Use this for pagination when you have many workspaces.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of workspaces to return per page',
          longDesc: 'The number of workspaces to return per page. Maximum is 200, default is 10.',
        },
      },
    },

    create_image: {
      displayName: 'Create Image',
      shortDesc: 'Upload an image to your Typeform account for use in forms.',
      longDesc:
        'Uploads an image to your Typeform account that can be used in your forms for picture choice questions, form backgrounds, or other visual elements. You can upload either by providing a file or a URL to an existing image.',
      options: {
        url: {
          displayName: 'Image URL',
          shortDesc: 'URL of the image to upload',
          longDesc:
            'The URL of an existing image to upload to your Typeform account. Use this if you have an image hosted elsewhere.',
        },
        file_name: {
          displayName: 'File Name',
          shortDesc: 'Custom name for the uploaded image',
          longDesc:
            'Optional custom name for the uploaded image. If not provided, the original filename will be used.',
        },
        image: {
          displayName: 'Image File',
          shortDesc: 'Image file to upload',
          longDesc:
            'The image file to upload directly to your Typeform account. Supported formats include JPG, PNG, and GIF.',
        },
      },
    },

    delete_form: {
      displayName: 'Delete Form',
      shortDesc: 'Permanently delete a Typeform from your account.',
      longDesc:
        'Permanently deletes a Typeform from your account. This action cannot be undone, and all associated responses will also be deleted. Use with caution as this will remove the form and all its data.',
      options: {
        form_id: {
          displayName: 'Form',
          shortDesc: 'The form to delete',
          longDesc: 'Select the Typeform that you want to permanently delete from your account.',
        },
      },
    },

    delete_image: {
      displayName: 'Delete Image',
      shortDesc: 'Delete an image from your Typeform account.',
      longDesc:
        'Removes an image from your Typeform account. Once deleted, the image will no longer be available for use in any forms. Make sure the image is not currently being used in any active forms before deletion.',
      options: {
        image_id: {
          displayName: 'Image',
          shortDesc: 'The image to delete',
          longDesc: 'Select the image that you want to delete from your Typeform account.',
        },
      },
    },

    get_form: {
      displayName: 'Get Form',
      shortDesc: 'Retrieve detailed information about a specific Typeform.',
      longDesc:
        'Fetches complete details about a specific Typeform including all fields, settings, thank you screens, and metadata. Use this to get the full form definition for analysis, backup, or integration purposes.',
      options: {
        form_id: {
          displayName: 'Form',
          shortDesc: 'The form to retrieve',
          longDesc: 'Select the Typeform that you want to get detailed information about.',
        },
      },
    },

    list_forms: {
      displayName: 'List Forms',
      shortDesc: 'Retrieve a list of forms in your Typeform account.',
      longDesc:
        'Fetches all forms in your Typeform account with filtering, sorting, and pagination options. Use this to get an overview of your forms, find specific forms by search criteria, or integrate with other systems.',
      options: {
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter forms by title',
          longDesc:
            'Optional search term to filter forms by their title. Leave empty to retrieve all forms.',
        },
        page: {
          displayName: 'Page',
          shortDesc: 'Page number for pagination',
          longDesc:
            'The page number to retrieve. Use this for pagination when you have many forms.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of forms to return per page',
          longDesc: 'The number of forms to return per page. Maximum is 200, default is 10.',
        },
        workspace_id: {
          displayName: 'Workspace ID',
          shortDesc: 'Filter forms by workspace',
          longDesc: 'Optional workspace ID to filter forms that belong to a specific workspace.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the results',
          longDesc: 'Specify how to sort the returned forms.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Choose which field to sort the forms by.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
      },
    },

    list_images: {
      displayName: 'List Images',
      shortDesc: 'Retrieve all images in your Typeform account.',
      longDesc:
        'Fetches all images that have been uploaded to your Typeform account. Use this to see what images are available for use in your forms, manage your image library, or get image URLs for integration purposes.',
    },

    list_responses: {
      displayName: 'List Responses',
      shortDesc: 'Retrieve responses submitted to a specific Typeform.',
      longDesc:
        'Fetches all responses submitted to a specific Typeform with comprehensive filtering and sorting options. Use this to analyze form submissions, export data, or integrate responses with other systems.',
      options: {
        form_id: {
          displayName: 'Form',
          shortDesc: 'The form to get responses from',
          longDesc: 'Select the Typeform that you want to retrieve responses from.',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of responses to return',
          longDesc: 'The number of responses to return. Maximum is 1000, default is 25.',
        },
        since: {
          displayName: 'Since Date',
          shortDesc: 'Only include responses submitted after this date',
          longDesc: 'Filter responses to only include those submitted after the specified date.',
        },
        until: {
          displayName: 'Until Date',
          shortDesc: 'Only include responses submitted before this date',
          longDesc: 'Filter responses to only include those submitted before the specified date.',
        },
        after: {
          displayName: 'After Token',
          shortDesc: 'Pagination token for results after a specific response',
          longDesc:
            'Use this token for pagination to get responses that come after a specific response.',
        },
        before: {
          displayName: 'Before Token',
          shortDesc: 'Pagination token for results before a specific response',
          longDesc:
            'Use this token for pagination to get responses that come before a specific response.',
        },
        included_response_ids: {
          displayName: 'Include Response IDs',
          shortDesc: 'Specific response IDs to include',
          longDesc:
            'List of specific response IDs to include in the results. Only these responses will be returned.',
        },
        excluded_response_ids: {
          displayName: 'Exclude Response IDs',
          shortDesc: 'Specific response IDs to exclude',
          longDesc: 'List of specific response IDs to exclude from the results.',
        },
        response_type: {
          displayName: 'Response Types',
          shortDesc: 'Filter by response completion status',
          longDesc: 'Filter responses by their completion status (started, partial, or completed).',
        },
        completed: {
          displayName: 'Completed Only',
          shortDesc: 'Only return completed responses',
          longDesc:
            'Set to true to only return completed responses, false for incomplete responses.',
        },
        order: {
          displayName: 'Sort Order',
          shortDesc: 'How to sort the results',
          longDesc: 'Specify how to sort the returned responses.',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Choose which field to sort the responses by.',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort direction',
                longDesc: 'Choose whether to sort in ascending or descending order.',
              },
            },
          },
        },
        query: {
          displayName: 'Query',
          shortDesc: 'Advanced query to filter responses',
          longDesc: 'Advanced query string to filter responses based on answer values.',
        },
        fields: {
          displayName: 'Include Fields',
          shortDesc: 'Specific fields to include in responses',
          longDesc: 'List of specific field IDs to include in the response data.',
        },
        answered_fields: {
          displayName: 'Answered Fields',
          shortDesc: 'Only include responses that answered these fields',
          longDesc: 'List of field IDs that must have been answered for a response to be included.',
        },
      },
    },
    create_form: {
      displayName: 'Create Form',
      shortDesc: 'Create a new Typeform with fields, logic, and custom settings.',
      longDesc:
        'Creates a comprehensive new Typeform with complete customization options including fields, welcome screens, thank you screens, conditional logic, scoring, and advanced settings. Perfect for building surveys, quizzes, contact forms, or any interactive form with complex branching logic and custom styling.',
      options: {
        title: {
          displayName: 'Form Title',
          shortDesc: 'The title of your new form',
          longDesc:
            'The main title that will appear at the top of your form and in your form list.',
        },
        fields: {
          displayName: 'Form Fields',
          shortDesc: 'The questions and input fields for your form',
          longDesc:
            'Add questions and input fields to your form. Each field can be customized with different types, properties, validations, and scoring options.',
          type: {
            element_type: {
              type: {
                fields: {
                  ref: {
                    displayName: 'Field Reference',
                    shortDesc: 'Unique reference for this field',
                    longDesc:
                      'Optional unique reference ID for this field that can be used in logic and integrations.',
                  },
                  title: {
                    displayName: 'Question Title',
                    shortDesc: 'The question or prompt text',
                    longDesc: 'The main question text that users will see for this field.',
                  },
                  type: {
                    displayName: 'Field Type',
                    shortDesc: 'The type of input field',
                    longDesc:
                      'Choose the type of input field (text, multiple choice, email, etc.).',
                  },
                  properties: {
                    displayName: 'Field Properties',
                    shortDesc: 'Additional configuration for this field',
                    longDesc:
                      'Configure field-specific properties like choices, descriptions, and behavior.',
                    type: {
                      fields: {
                        description: {
                          displayName: 'Description',
                          shortDesc: 'Additional description or help text for this field',
                          longDesc:
                            'Optional description text that appears below the question to provide additional context or instructions.',
                        },
                        choices: {
                          displayName: 'Answer Choices',
                          shortDesc: 'Available answer options for multiple choice fields',
                          longDesc:
                            'Define the available answer choices for multiple choice, dropdown, or picture choice fields.',
                          type: {
                            element_type: {
                              type: {
                                fields: {
                                  ref: {
                                    displayName: 'Choice Reference',
                                    shortDesc: 'Unique reference for this choice',
                                    longDesc:
                                      'Optional unique reference ID for this choice option.',
                                  },
                                  label: {
                                    displayName: 'Choice Label',
                                    shortDesc: 'The text label for this choice',
                                    longDesc:
                                      'The text that users will see for this answer choice.',
                                  },
                                  attachment: {
                                    displayName: 'Choice Attachment',
                                    shortDesc: 'Image or media attached to this choice',
                                    longDesc:
                                      'Optional image or media file attached to this choice option.',
                                    type: {
                                      fields: {
                                        type: {
                                          displayName: 'Attachment Type',
                                          shortDesc: 'Type of media attachment',
                                          longDesc: 'The type of media file (image or video).',
                                        },
                                        href: {
                                          displayName: 'Attachment URL',
                                          shortDesc: 'URL of the media file',
                                          longDesc: 'The URL or path to the media file.',
                                        },
                                        properties: {
                                          displayName: 'Attachment Properties',
                                          shortDesc: 'Additional properties for the attachment',
                                          longDesc:
                                            'Configure additional properties for the media attachment.',
                                          type: {
                                            fields: {
                                              description: {
                                                displayName: 'Attachment Description',
                                                shortDesc: 'Description for the attachment',
                                                longDesc:
                                                  'Optional description or alt text for the media attachment.',
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
                        allow_multiple_selection: {
                          displayName: 'Allow Multiple Selection',
                          shortDesc: 'Allow users to select multiple choices',
                          longDesc:
                            'Enable this to allow users to select more than one answer option.',
                        },
                        randomize: {
                          displayName: 'Randomize Choices',
                          shortDesc: 'Show choices in random order',
                          longDesc: 'Randomize the order of answer choices for each respondent.',
                        },
                        allow_other_choice: {
                          displayName: 'Allow Other Choice',
                          shortDesc: 'Include an "Other" option with text input',
                          longDesc:
                            'Add an "Other" option that allows users to enter their own custom answer.',
                        },
                        vertical_alignment: {
                          displayName: 'Vertical Alignment',
                          shortDesc: 'Display choices vertically',
                          longDesc:
                            'Display answer choices in a vertical list instead of horizontally.',
                        },
                        supersized: {
                          displayName: 'Supersized',
                          shortDesc: 'Display choices in large format',
                          longDesc: 'Show answer choices in a larger, more prominent format.',
                        },
                        show_labels: {
                          displayName: 'Show Labels',
                          shortDesc: 'Display labels on rating scales',
                          longDesc: 'Show text labels on rating scales and opinion scales.',
                        },
                        alphabetical_order: {
                          displayName: 'Alphabetical Order',
                          shortDesc: 'Sort choices alphabetically',
                          longDesc: 'Automatically sort answer choices in alphabetical order.',
                        },
                        hide_marks: {
                          displayName: 'Hide Marks',
                          shortDesc: 'Hide scale markings',
                          longDesc: 'Hide the numerical markings on rating and opinion scales.',
                        },
                        button_text: {
                          displayName: 'Button Text',
                          shortDesc: 'Custom text for the continue button',
                          longDesc:
                            'Customize the text that appears on the continue/submit button for this field.',
                        },
                        start_at_one: {
                          displayName: 'Start at One',
                          shortDesc: 'Start scale numbering at 1 instead of 0',
                          longDesc: 'Begin scale numbering at 1 instead of the default 0.',
                        },
                        structure: {
                          displayName: 'Date Structure',
                          shortDesc: 'Format for date input fields',
                          longDesc:
                            'Choose the date format structure (MMDDYYYY, DDMMYYYY, or YYYYMMDD).',
                        },
                        separator: {
                          displayName: 'Date Separator',
                          shortDesc: 'Separator character for date fields',
                          longDesc:
                            'Choose the separator character used between date components (/, -, or .).',
                        },
                        currency: {
                          displayName: 'Payment Currency',
                          shortDesc: 'Currency for payment fields',
                          longDesc: 'Select the currency to use for payment fields.',
                        },
                        price: {
                          displayName: 'Payment Price',
                          shortDesc: 'Price configuration for payment fields',
                          longDesc: 'Configure the price structure for payment fields.',
                          type: {
                            fields: {
                              type: {
                                displayName: 'Price Type',
                                shortDesc: 'Type of price calculation',
                                longDesc: 'Specify how the price should be calculated.',
                              },
                              value: {
                                displayName: 'Price Value',
                                shortDesc: 'The price value or variable',
                                longDesc:
                                  'The actual price value or reference to a price variable.',
                              },
                            },
                          },
                        },
                        show_button: {
                          displayName: 'Show Button',
                          shortDesc: 'Display a button on this field',
                          longDesc: 'Show a continue or action button for this field.',
                        },
                        default_country_code: {
                          displayName: 'Default Country Code',
                          shortDesc: 'Default country for phone number fields',
                          longDesc: 'Set the default country code for phone number input fields.',
                        },
                        steps: {
                          displayName: 'Scale Steps',
                          shortDesc: 'Number of steps in rating scales',
                          longDesc:
                            'Define the number of steps or points in rating and opinion scales.',
                        },
                        shape: {
                          displayName: 'Rating Shape',
                          shortDesc: 'Visual shape for rating fields',
                          longDesc:
                            'Choose the visual representation for rating fields (stars, hearts, etc.).',
                        },
                        labels: {
                          displayName: 'Scale Labels',
                          shortDesc: 'Custom labels for scale endpoints',
                          longDesc:
                            'Add custom text labels for the left, right, and center points of scales.',
                          type: {
                            fields: {
                              left: {
                                displayName: 'Left Label',
                                shortDesc: 'Label for the left end of the scale',
                                longDesc:
                                  'Custom text label for the left (minimum) end of the scale.',
                              },
                              right: {
                                displayName: 'Right Label',
                                shortDesc: 'Label for the right end of the scale',
                                longDesc:
                                  'Custom text label for the right (maximum) end of the scale.',
                              },
                              center: {
                                displayName: 'Center Label',
                                shortDesc: 'Label for the center of the scale',
                                longDesc: 'Custom text label for the center point of the scale.',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  validations: {
                    displayName: 'Field Validations',
                    shortDesc: 'Validation rules for this field',
                    longDesc:
                      'Set validation rules like required fields, minimum/maximum values, and length limits.',
                    type: {
                      fields: {
                        required: {
                          displayName: 'Required Field',
                          shortDesc: 'Make this field mandatory',
                          longDesc: 'Require users to answer this field before proceeding.',
                        },
                        max_length: {
                          displayName: 'Maximum Length',
                          shortDesc: 'Maximum number of characters allowed',
                          longDesc: 'Set the maximum number of characters users can enter.',
                        },
                        min_value: {
                          displayName: 'Minimum Value',
                          shortDesc: 'Minimum numeric value allowed',
                          longDesc: 'Set the minimum numeric value for number fields.',
                        },
                        max_value: {
                          displayName: 'Maximum Value',
                          shortDesc: 'Maximum numeric value allowed',
                          longDesc: 'Set the maximum numeric value for number fields.',
                        },
                        min_selection: {
                          displayName: 'Minimum Selections',
                          shortDesc: 'Minimum number of choices to select',
                          longDesc: 'Require users to select at least this many choices.',
                        },
                        max_selection: {
                          displayName: 'Maximum Selections',
                          shortDesc: 'Maximum number of choices to select',
                          longDesc: 'Limit users to selecting no more than this many choices.',
                        },
                      },
                    },
                  },
                  attachment: {
                    displayName: 'Field Attachment',
                    shortDesc: 'Media attachment for this field',
                    longDesc: 'Add an image or video attachment to this field.',
                  },
                  layout: {
                    displayName: 'Field Layout',
                    shortDesc: 'Layout configuration for media attachments',
                    longDesc: 'Configure how media attachments are displayed with this field.',
                  },
                  scoring: {
                    displayName: 'Field Scoring',
                    shortDesc: 'Scoring rules for quiz fields',
                    longDesc: 'Configure scoring rules for quiz and assessment fields.',
                    type: {
                      fields: {
                        type: {
                          displayName: 'Scoring Type',
                          shortDesc: 'Type of scoring method',
                          longDesc: 'Choose the scoring method for this field.',
                        },
                        boolean_correct: {
                          displayName: 'Boolean Correct Scoring',
                          shortDesc: 'Scoring for true/false questions',
                          longDesc: 'Configure scoring for boolean/true-false questions.',
                          type: {
                            fields: {
                              boolean: {
                                displayName: 'Correct Answer',
                                shortDesc: 'The correct boolean value',
                                longDesc: 'Specify whether true or false is the correct answer.',
                              },
                              score: {
                                displayName: 'Score Points',
                                shortDesc: 'Points awarded for correct answer',
                                longDesc: 'Number of points to award when answered correctly.',
                              },
                            },
                          },
                        },
                        choices_all_correct: {
                          displayName: 'Multiple Choice Scoring',
                          shortDesc: 'Scoring for multiple choice questions',
                          longDesc: 'Configure scoring for multiple choice questions.',
                          type: {
                            fields: {
                              choices: {
                                displayName: 'Correct Choices',
                                shortDesc: 'List of correct choice references',
                                longDesc: 'References to the correct answer choices.',
                              },
                              score: {
                                displayName: 'Score Points',
                                shortDesc: 'Points awarded for correct answer',
                                longDesc: 'Number of points to award when answered correctly.',
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
        hidden: {
          displayName: 'Hidden Fields',
          shortDesc: 'Hidden fields to pass data through the form',
          longDesc:
            'List of hidden field names that can be used to pass data through URL parameters.',
        },
        variables: {
          displayName: 'Form Variables',
          shortDesc: 'Custom variables for calculations and logic',
          longDesc:
            'Define custom variables that can be used in calculations and conditional logic.',
          type: {
            fields: {
              score: {
                displayName: 'Score Variable',
                shortDesc: 'Variable to track quiz scores',
                longDesc: 'Numeric variable used to calculate and track quiz or assessment scores.',
              },
              price: {
                displayName: 'Price Variable',
                shortDesc: 'Variable to track payment amounts',
                longDesc: 'Numeric variable used to calculate and track payment amounts.',
              },
            },
          },
        },
        welcome_screens: {
          displayName: 'Welcome Screens',
          shortDesc: 'Introductory screens shown before the form',
          longDesc:
            'Create welcome screens to introduce your form, explain its purpose, or provide instructions.',
          type: {
            element_type: {
              type: {
                fields: {
                  ref: {
                    displayName: 'Screen Reference',
                    shortDesc: 'Unique reference for this screen',
                    longDesc: 'Optional unique reference ID for this welcome screen.',
                  },
                  title: {
                    displayName: 'Screen Title',
                    shortDesc: 'Title text for this welcome screen',
                    longDesc: 'The main title text displayed on this welcome screen.',
                  },
                  properties: {
                    displayName: 'Screen Properties',
                    shortDesc: 'Configuration options for this screen',
                    longDesc: 'Configure the appearance and behavior of this welcome screen.',
                    type: {
                      fields: {
                        description: {
                          displayName: 'Screen Description',
                          shortDesc: 'Description text for this screen',
                          longDesc:
                            'Additional description or instruction text for this welcome screen.',
                        },
                        show_button: {
                          displayName: 'Show Button',
                          shortDesc: 'Display a continue button',
                          longDesc: 'Show a continue button on this welcome screen.',
                        },
                        button_text: {
                          displayName: 'Button Text',
                          shortDesc: 'Custom text for the continue button',
                          longDesc: 'Customize the text that appears on the continue button.',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        thankyou_screens: {
          displayName: 'Thank You Screens',
          shortDesc: 'Screens shown after form completion',
          longDesc:
            'Create custom thank you screens to show appreciation, provide next steps, or display results.',
          type: {
            element_type: {
              type: {
                fields: {
                  ref: {
                    displayName: 'Screen Reference',
                    shortDesc: 'Unique reference for this screen',
                    longDesc: 'Optional unique reference ID for this thank you screen.',
                  },
                  title: {
                    displayName: 'Screen Title',
                    shortDesc: 'Title text for this thank you screen',
                    longDesc: 'The main title text displayed on this thank you screen.',
                  },
                  properties: {
                    displayName: 'Screen Properties',
                    shortDesc: 'Configuration options for this screen',
                    longDesc: 'Configure the appearance and behavior of this thank you screen.',
                    type: {
                      fields: {
                        description: {
                          displayName: 'Screen Description',
                          shortDesc: 'Description text for this screen',
                          longDesc:
                            'Additional description or message text for this thank you screen.',
                        },
                        show_button: {
                          displayName: 'Show Button',
                          shortDesc: 'Display an action button',
                          longDesc: 'Show an action button on this thank you screen.',
                        },
                        button_text: {
                          displayName: 'Button Text',
                          shortDesc: 'Custom text for the action button',
                          longDesc: 'Customize the text that appears on the action button.',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        settings: {
          displayName: 'Form Settings',
          shortDesc: 'Global settings and configuration for the form',
          longDesc:
            'Configure form-wide settings like language, progress bar, branding, and behavior options.',
          type: {
            fields: {
              language: {
                displayName: 'Form Language',
                shortDesc: 'Language for form interface',
                longDesc: 'Set the language for form interface elements and default text.',
              },
              is_public: {
                displayName: 'Public Form',
                shortDesc: 'Make form publicly accessible',
                longDesc: 'Allow anyone with the link to access and submit the form.',
              },
              autosave_progress: {
                displayName: 'Autosave Progress',
                shortDesc: 'Automatically save user progress',
                longDesc:
                  'Save user progress automatically so they can continue later if interrupted.',
              },
              progress_bar: {
                displayName: 'Progress Bar Type',
                shortDesc: 'Style of progress indicator',
                longDesc: 'Choose how to display form progress (percentage or proportion).',
              },
              show_progress_bar: {
                displayName: 'Show Progress Bar',
                shortDesc: 'Display progress indicator',
                longDesc: 'Show a progress bar to indicate how much of the form is completed.',
              },
              show_typeform_branding: {
                displayName: 'Show Typeform Branding',
                shortDesc: 'Display Typeform branding',
                longDesc: 'Show Typeform branding elements on the form.',
              },
              show_time_to_complete: {
                displayName: 'Show Time to Complete',
                shortDesc: 'Display estimated completion time',
                longDesc: 'Show an estimated time to complete the form.',
              },
              show_number_of_submissions: {
                displayName: 'Show Submission Count',
                shortDesc: 'Display number of submissions',
                longDesc: 'Show how many people have already submitted the form.',
              },
              show_cookie_consent: {
                displayName: 'Show Cookie Consent',
                shortDesc: 'Display cookie consent notice',
                longDesc: 'Show a cookie consent notice for GDPR compliance.',
              },
              show_question_number: {
                displayName: 'Show Question Numbers',
                shortDesc: 'Display question numbers',
                longDesc: 'Show question numbers next to each field.',
              },
              show_key_hint_on_choices: {
                displayName: 'Show Keyboard Hints',
                shortDesc: 'Display keyboard shortcuts for choices',
                longDesc: 'Show keyboard shortcut hints for multiple choice answers.',
              },
              hide_navigation: {
                displayName: 'Hide Navigation',
                shortDesc: 'Hide navigation buttons',
                longDesc: 'Hide the back and forward navigation buttons.',
              },
              redirect_after_submit_url: {
                displayName: 'Redirect URL',
                shortDesc: 'URL to redirect after submission',
                longDesc: 'URL to redirect users to after they submit the form.',
              },
              google_analytics: {
                displayName: 'Google Analytics ID',
                shortDesc: 'Google Analytics tracking ID',
                longDesc: 'Google Analytics tracking ID for form analytics.',
              },
              facebook_pixel: {
                displayName: 'Facebook Pixel ID',
                shortDesc: 'Facebook Pixel tracking ID',
                longDesc: 'Facebook Pixel ID for conversion tracking.',
              },
              google_tag_manager: {
                displayName: 'Google Tag Manager ID',
                shortDesc: 'Google Tag Manager container ID',
                longDesc: 'Google Tag Manager container ID for advanced tracking.',
              },
              captcha: {
                displayName: 'Enable CAPTCHA',
                shortDesc: 'Enable CAPTCHA verification',
                longDesc: 'Enable CAPTCHA to prevent spam submissions.',
              },
              duplicate_prevention: {
                displayName: 'Duplicate Prevention',
                shortDesc: 'Prevent duplicate submissions',
                longDesc: 'Configure settings to prevent users from submitting multiple responses.',
                type: {
                  fields: {
                    type: {
                      displayName: 'Prevention Type',
                      shortDesc: 'Method for preventing duplicates',
                      longDesc: 'Choose the method for preventing duplicate submissions.',
                    },
                  },
                },
              },
              responses_limit: {
                displayName: 'Response Limit',
                shortDesc: 'Maximum number of responses',
                longDesc: 'Set a limit on the total number of responses the form will accept.',
              },
              period: {
                displayName: 'Limit Period',
                shortDesc: 'Time period for response limits',
                longDesc: 'Time period for response limits (day, week, month, or year).',
              },
            },
          },
        },
        logic: {
          displayName: 'Conditional Logic',
          shortDesc: 'Rules for conditional branching and calculations',
          longDesc:
            'Create conditional logic rules to show/hide fields, jump to different sections, or perform calculations based on user responses.',
          type: {
            element_type: {
              type: {
                fields: {
                  type: {
                    displayName: 'Logic Type',
                    shortDesc: 'Type of field this logic applies to',
                    longDesc: 'Specify whether this logic applies to a form field or hidden field.',
                  },
                  ref: {
                    displayName: 'Field Reference',
                    shortDesc: 'Reference to the field this logic applies to',
                    longDesc:
                      'The reference ID of the field this conditional logic rule applies to.',
                  },
                  actions: {
                    displayName: 'Logic Actions',
                    shortDesc: 'Actions to perform when conditions are met',
                    longDesc: 'Define what actions to take when the specified conditions are met.',
                    type: {
                      element_type: {
                        type: {
                          fields: {
                            action: {
                              displayName: 'Action Type',
                              shortDesc: 'Type of action to perform',
                              longDesc:
                                'Choose the type of action (jump, add, subtract, multiply, divide, set).',
                            },
                            details: {
                              displayName: 'Action Details',
                              shortDesc: 'Specific details for this action',
                              longDesc: 'Configure the specific parameters for this action.',
                              type: {
                                fields: {
                                  to: {
                                    displayName: 'Jump Target',
                                    shortDesc: 'Where to jump to',
                                    longDesc: 'Configure the target for jump actions.',
                                    type: {
                                      fields: {
                                        type: {
                                          displayName: 'Target Type',
                                          shortDesc: 'Type of jump target',
                                          longDesc:
                                            'Specify the type of target (field, thankyou, outcome).',
                                        },
                                        value: {
                                          displayName: 'Target Value',
                                          shortDesc: 'Reference to the target',
                                          longDesc:
                                            'The reference ID of the target field or screen.',
                                        },
                                      },
                                    },
                                  },
                                  target: {
                                    displayName: 'Calculation Target',
                                    shortDesc: 'Target for calculations',
                                    longDesc:
                                      'Specify the target variable for calculation actions.',
                                    type: {
                                      fields: {
                                        type: {
                                          displayName: 'Target Type',
                                          shortDesc: 'Type of calculation target',
                                          longDesc: 'The type of target (usually variable).',
                                        },
                                        value: {
                                          displayName: 'Target Variable',
                                          shortDesc: 'Name of the target variable',
                                          longDesc: 'The name of the variable to modify.',
                                        },
                                      },
                                    },
                                  },
                                  value: {
                                    displayName: 'Calculation Value',
                                    shortDesc: 'Value for calculations',
                                    longDesc: 'The value to use in calculation actions.',
                                    type: {
                                      fields: {
                                        type: {
                                          displayName: 'Value Type',
                                          shortDesc: 'Type of value',
                                          longDesc:
                                            'Specify whether this is a constant, variable, or evaluation.',
                                        },
                                        value: {
                                          displayName: 'Actual Value',
                                          shortDesc: 'The actual value or reference',
                                          longDesc:
                                            'The actual value, variable name, or expression to use.',
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            condition: {
                              displayName: 'Action Condition',
                              shortDesc: 'Condition that triggers this action',
                              longDesc:
                                'Define the condition that must be met for this action to execute.',
                              type: {
                                fields: {
                                  op: {
                                    displayName: 'Operator',
                                    shortDesc: 'Comparison operator',
                                    longDesc: 'The operator to use for comparing values.',
                                  },
                                  vars: {
                                    displayName: 'Variables',
                                    shortDesc: 'Variables to compare',
                                    longDesc:
                                      'The variables or values to compare in this condition.',
                                    type: {
                                      element_type: {
                                        type: {
                                          fields: {
                                            type: {
                                              displayName: 'Variable Type',
                                              shortDesc: 'Type of variable',
                                              longDesc:
                                                'Specify the type of variable (field, hidden, variable, constant, choice).',
                                            },
                                            value: {
                                              displayName: 'Variable Value',
                                              shortDesc: 'The value or reference',
                                              longDesc: 'The actual value or reference to compare.',
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
            },
          },
        },
      },
    },
  },
};

export default TypeformAppEn;
