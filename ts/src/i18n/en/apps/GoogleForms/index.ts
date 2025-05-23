

const GoogleFormsAppEn = {
  displayName: 'Google Forms',
  shortDesc: 'Connect with Google Forms to manage your forms and responses',
  longDesc:
    'Integrate with Google Forms to create, update, and manage your forms and responses. This integration allows you to perform actions and respond to events in your Google Forms account, enabling you to automate form management and data collection workflows.',
  triggers: {
    new_form_response: {
      displayName: 'New Form Response',
      shortDesc: 'Triggers when a new response is submitted to a Google Form.',
      longDesc:
        'Monitors a Google Form for new responses and triggers when someone submits a new response. Optionally includes form questions and metadata in the event data.',
      options: {
        form_id: {
          displayName: 'Form ID',
          shortDesc: 'The Google Form to monitor',
          longDesc: 'The unique identifier of the Google Form to monitor for new responses.',
        },
        include_questions: {
          displayName: 'Include Questions',
          shortDesc: 'Include form questions in the event data',
          longDesc:
            'Whether to include the form questions and metadata in each triggered event. Default is false.',
        },
        include_answers: {
          displayName: 'Include Answers',
          shortDesc: 'Include detailed answers in the event data',
          longDesc:
            'Whether to include the form answers in each triggered event. Default is false.',
        },
      },
      event_info: {
        desc: 'Event data for new Google Forms responses',
      },
    },
  },
  actions: {
    get_form_response: {
      displayName: 'Get Form Response',
      shortDesc: 'Retrieve a specific response from a Google Form by its ID.',
      longDesc:
        'Retrieves a single response from a specified Google Form using the response ID. Optionally includes form questions and metadata for additional context.',
      options: {
        form_id: {
          displayName: 'Form ID',
          shortDesc: 'The Google Form to get the response from',
          longDesc: 'The unique identifier of the Google Form that contains the response.',
        },
        response_id: {
          displayName: 'Response ID',
          shortDesc: 'The specific response to retrieve',
          longDesc: 'The unique identifier of the form response to retrieve.',
        },
        include_questions: {
          displayName: 'Include Questions',
          shortDesc: 'Include form questions in response',
          longDesc:
            'Whether to include the form questions and metadata in the response. Default is false.',
        },
      },
    },
    update_form_publish_settings: {
      displayName: 'Update Form Publish Settings',
      shortDesc: 'Update the publishing settings of a Google Form.',
      longDesc:
        'Updates the publish settings of a Google Form, including whether it is accepting responses and whether it is published. At least one setting must be provided.',
      options: {
        form_id: {
          displayName: 'Form ID',
          shortDesc: 'The Google Form to update',
          longDesc:
            'The unique identifier of the Google Form whose publish settings will be updated.',
        },
        is_accepting_responses: {
          displayName: 'Is Accepting Responses',
          shortDesc: 'Whether the form should accept new responses',
          longDesc:
            'Set to true to allow new responses, false to stop accepting responses. Leave empty to keep current setting.',
        },
        is_published: {
          displayName: 'Is Published',
          shortDesc: 'Whether the form should be published',
          longDesc:
            'Set to true to publish the form, false to unpublish it. Leave empty to keep current setting.',
        },
      },
    },
    get_form: {
      displayName: 'Get Form',
      shortDesc: 'Retrieve details of a Google Form by ID.',
      longDesc:
        'Fetches comprehensive information about a Google Form, including its metadata, questions, and optionally its responses.',
      options: {
        form_id: {
          displayName: 'Form ID',
          shortDesc: 'Google Form ID',
          longDesc: 'The unique identifier of the Google Form to retrieve.',
        },
        include_questions: {
          displayName: 'Include Questions',
          shortDesc: 'Include form questions in the response',
          longDesc:
            'When enabled, returns the complete list of questions in the form with their properties.',
        },
        include_responses: {
          displayName: 'Include Responses',
          shortDesc: 'Include form responses in the result',
          longDesc:
            'When enabled, fetches all submitted responses for the form. May increase response time for forms with many submissions.',
        },
      },
    },
    get_form_responses: {
      displayName: 'Get Form Responses',
      shortDesc: 'Retrieve responses from a Google Form with filtering and pagination.',
      longDesc:
        'Retrieves all responses from a specified Google Form. Supports filtering by respondent email and answer values, pagination with page tokens, and optional inclusion of form questions and metadata.',
      options: {
        form_id: {
          displayName: 'Form ID',
          shortDesc: 'The Google Form to get responses from',
          longDesc: 'The unique identifier of the Google Form to retrieve responses from.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of responses to return',
          longDesc:
            'The maximum number of responses to return per request. Default is 50, maximum is 1000.',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'A token to retrieve the next page of results. Used for pagination through large response sets.',
        },
        respondent_email: {
          displayName: 'Respondent Email',
          shortDesc: 'Filter by respondent email',
          longDesc:
            'Filter responses to only include those from respondents with emails containing this value.',
        },
        filter_answers: {
          displayName: 'Filter Answers',
          shortDesc: 'Filter responses by specific answer values',
          longDesc:
            'Filter responses based on specific question answers. Each filter specifies a question ID, filter type, and expected value.',
          type: {
            fields: {
              question_id: {
                displayName: 'Question ID',
                shortDesc: 'The question to filter by',
                longDesc: 'The unique identifier of the question to filter responses by.',
              },
              filter_type: {
                displayName: 'Filter Type',
                shortDesc: 'Type of filter to apply',
                longDesc: 'Whether the answer should contain or exactly equal the filter value.',
              },
              value: {
                displayName: 'Filter Value',
                shortDesc: 'Value to filter by',
                longDesc: 'The value to match against the question answers.',
              },
            },
          },
        },
        include_questions: {
          displayName: 'Include Questions',
          shortDesc: 'Include form questions in response',
          longDesc:
            'Whether to include the form questions and metadata in the response. Default is false.',
        },
        include_answers: {
          displayName: 'Include Answers',
          shortDesc: 'Include detailed answers in response',
          longDesc:
            'Whether to include the detailed answer data for each response. Default is true.',
        },
      },
    },
    search_forms: {
      displayName: 'Search Forms',
      shortDesc: 'Search for Google Forms by name with filtering options.',
      longDesc:
        'Search for Google Forms in your Google Drive with options to filter by filename, specify search type, and paginate results.',
      options: {
        filename: {
          displayName: 'Form Name',
          shortDesc: 'Name of the form to search for',
          longDesc:
            'The name or part of the name of the Google Forms to search for. Leave empty to retrieve all forms.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'Type of search to perform',
          longDesc:
            'Specify whether to search for forms where the name contains the search term or matches it exactly.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of forms to return',
          longDesc:
            'The maximum number of forms to return in a single request. Maximum value is 1000.',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'A token returned from a previous search to continue pagination. Use the next_page_token from a previous response.',
        },
      },
    },
    create_form: {
      displayName: 'Create Form',
      shortDesc: 'Create a new Google Form with customizable questions and settings.',
      longDesc:
        'Creates a new Google Form with specified title, description, and optional questions. Supports various question types, quiz functionality, and custom form settings.',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'Form title',
          longDesc: 'The title of the Google Form. This will be displayed at the top of the form.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Form description',
          longDesc:
            'An optional description that appears below the form title to provide additional context.',
        },
        document_title: {
          displayName: 'Document Title',
          shortDesc: 'Title for the document',
          longDesc:
            'The document title that appears in the browser tab. If not specified, the form title will be used.',
        },
        settings: {
          displayName: 'Form Settings',
          shortDesc: 'Additional form settings',
          longDesc: 'Configure additional form settings like email collection and quiz mode.',
          type: {
            fields: {
              email_collection: {
                displayName: 'Email Collection',
                shortDesc: 'Email collection settings',
                longDesc: 'Controls how email addresses are collected from form respondents.',
              },
              is_quiz: {
                displayName: 'Quiz Mode',
                shortDesc: 'Enable quiz functionality',
                longDesc: 'When enabled, allows setting correct answers and points for questions.',
              },
            },
          },
        },
        questions: {
          displayName: 'Questions',
          shortDesc: 'Form questions',
          longDesc:
            'List of questions to add to the form. Each question can have different types and properties.',
          type: {
            element_type: {
              fields: {
                title: {
                  displayName: 'Question Title',
                  shortDesc: 'The question text',
                  longDesc: 'The main text of the question that will be shown to respondents.',
                },
                type: {
                  displayName: 'Question Type',
                  shortDesc: 'Type of question',
                  longDesc:
                    'The type of question to create (e.g., text, multiple-choice, checkbox, etc.).',
                },
                required: {
                  displayName: 'Required',
                  shortDesc: 'Make question required',
                  longDesc:
                    'When enabled, respondents must answer this question to submit the form.',
                },
                help_text: {
                  displayName: 'Help Text',
                  shortDesc: 'Additional guidance text',
                  longDesc:
                    'Optional text that appears below the question to provide additional guidance to respondents.',
                },
                choices: {
                  displayName: 'Answer Choices',
                  shortDesc: 'List of possible answers',
                  longDesc:
                    'For multiple-choice, checkbox, and dropdown questions, these are the options respondents can select from.',
                },
                scale_min: {
                  displayName: 'Scale Minimum',
                  shortDesc: 'Minimum value for scale',
                  longDesc:
                    'For scale questions, the lowest value on the scale. Must be between 0 and 10.',
                },
                scale_max: {
                  displayName: 'Scale Maximum',
                  shortDesc: 'Maximum value for scale',
                  longDesc:
                    'For scale questions, the highest value on the scale. Must be between 0 and 10.',
                },
                scale_min_label: {
                  displayName: 'Scale Minimum Label',
                  shortDesc: 'Label for minimum scale value',
                  longDesc: 'Optional label to describe the lowest value on a scale question.',
                },
                scale_max_label: {
                  displayName: 'Scale Maximum Label',
                  shortDesc: 'Label for maximum scale value',
                  longDesc: 'Optional label to describe the highest value on a scale question.',
                },
                correct_answer: {
                  displayName: 'Correct Answer',
                  shortDesc: 'The correct answer for quiz questions',
                  longDesc:
                    'For quiz questions, specifies the correct answer. For checkbox questions, multiple answers can be provided as a comma-separated list.',
                },
                points: {
                  displayName: 'Points',
                  shortDesc: 'Point value for quiz questions',
                  longDesc:
                    'For quiz questions, the number of points awarded for a correct answer.',
                },
                feedback: {
                  displayName: 'Feedback',
                  shortDesc: 'Feedback for quiz answers',
                  longDesc: 'For quiz questions, feedback to show respondents after they answer.',
                },
                shuffle_choices: {
                  displayName: 'Shuffle Choices',
                  shortDesc: 'Randomize answer choices',
                  longDesc:
                    'When enabled, the order of answer choices will be randomized for each respondent.',
                },
              },
            },
          },
        },
      },
    },
  },
};

export default GoogleFormsAppEn;
