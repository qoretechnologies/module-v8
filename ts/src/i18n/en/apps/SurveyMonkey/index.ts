/* eslint-disable max-len */
const SurveyMonkeyAppEn = {
  displayName: 'SurveyMonkey',
  groups: ['Survey & Feedback'],
  shortDesc: 'Online survey platform for collecting feedback and responses',
  longDesc: `Connect your SurveyMonkey account to automate survey management, collect responses, and manage contacts. Create collectors, send surveys, retrieve responses, and set up webhooks for real-time response notifications all from within Qore.`,
  connectionMessage: {
    title: 'Connect to SurveyMonkey',
    content: `To connect your SurveyMonkey account, you will need to authenticate using OAuth2.

## Authentication Process

1. Click the "Connect" button below
2. You will be redirected to SurveyMonkey to authorize the connection
3. Grant the required permissions for surveys, contacts, responses, collectors, and webhooks
4. You will be redirected back to complete the connection

## Required Scopes

- surveys_read, surveys_write - Manage surveys
- contacts_read, contacts_write - Manage contacts
- responses_read, responses_read_detail - Read survey responses
- collectors_read, collectors_write - Manage collectors
- webhooks_read, webhooks_write - Set up response webhooks`,
  },
  triggers: {
    new_response: {
      displayName: 'New Response',
      shortDesc: 'Triggers when a new survey response is completed',
      longDesc:
        'This trigger fires when a respondent completes a survey. The webhook payload includes basic response information. Use the "Get Response" action to fetch detailed response data including answers.',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to monitor for new responses',
          longDesc: 'Select the specific survey that you want to monitor for completed responses',
        },
      },
    },
  },
  actions: {
    create_contact: {
      groups: ['Contact Management'],
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact',
      longDesc: 'Create a new contact in SurveyMonkey with first name, last name, email, or phone number',
      options: {
        first_name: {
          displayName: 'First Name',
          shortDesc: "The contact's first name",
          longDesc: 'The first name of the contact',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name",
          longDesc: 'The last name of the contact',
        },
        email: {
          displayName: 'Email',
          shortDesc: "The contact's email address",
          longDesc: 'The email address for the contact (either email or phone number is required)',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: "The contact's phone number",
          longDesc: 'The phone number for the contact (either email or phone number is required)',
        },
      },
    },
    list_contacts: {
      groups: ['Data Retrieval'],
      displayName: 'List Contacts',
      shortDesc: 'Retrieve a list of contacts',
      longDesc: 'Retrieve a paginated list of contacts from SurveyMonkey',
      options: {
        page: {
          displayName: 'Page',
          shortDesc: 'Page number to retrieve',
          longDesc: 'The page number for pagination (starts at 1)',
        },
        per_page: {
          displayName: 'Per Page',
          shortDesc: 'Number of contacts per page',
          longDesc: 'The number of contacts to return per page (default: 100)',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc:
            'The maximum total number of contacts to retrieve across all pages (default: 500)',
        },
      },
    },
    create_collector: {
      groups: ['Survey Management'],
      displayName: 'Create Collector',
      shortDesc: 'Create a collector for a survey',
      longDesc: 'Create a new collector (distribution method) for a survey in SurveyMonkey',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to create a collector for',
          longDesc: 'Select the survey that you want to create a collector for',
        },
        type: {
          displayName: 'Collector Type',
          shortDesc: 'The type of collector',
          longDesc: 'Select the type of collector (email, weblink, facebook, or embed)',
        },
        name: {
          displayName: 'Collector Name',
          shortDesc: 'The name of the collector',
          longDesc: 'A descriptive name for the collector',
        },
      },
    },
    list_collectors: {
      groups: ['Data Retrieval'],
      displayName: 'List Collectors',
      shortDesc: 'Retrieve collectors for a survey',
      longDesc: 'Retrieve a paginated list of collectors for a specific survey',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to list collectors for',
          longDesc: 'Select the survey to retrieve collectors from',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of collectors to return',
          longDesc: 'The maximum total number of collectors to retrieve (default: 500)',
        },
      },
    },
    list_responses: {
      groups: ['Data Retrieval'],
      displayName: 'List Responses',
      shortDesc: 'Retrieve survey responses',
      longDesc: 'Retrieve a paginated list of responses for a specific survey',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to list responses for',
          longDesc: 'Select the survey to retrieve responses from',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of responses to return',
          longDesc: 'The maximum total number of responses to retrieve (default: 500)',
        },
      },
    },
    get_response: {
      groups: ['Data Retrieval'],
      displayName: 'Get Response',
      shortDesc: 'Retrieve a specific survey response',
      longDesc:
        'Retrieve detailed information about a specific survey response, optionally including full answer details',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey containing the response',
          longDesc: 'Select the survey that contains the response',
        },
        response_id: {
          displayName: 'Response ID',
          shortDesc: 'The ID of the response to retrieve',
          longDesc: 'The unique identifier of the response you want to retrieve',
        },
        include_answers: {
          displayName: 'Include Answers',
          shortDesc: 'Include detailed answer data',
          longDesc:
            'When enabled, retrieves the full response details including all question answers',
        },
      },
    },
    get_collector: {
      groups: ['Data Retrieval'],
      displayName: 'Get Collector',
      shortDesc: 'Retrieve collector details',
      longDesc: 'Retrieve detailed information about a specific collector',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey containing the collector',
          longDesc: 'Select the survey that contains the collector',
        },
        collector_id: {
          displayName: 'Collector',
          shortDesc: 'The collector to retrieve',
          longDesc: 'Select the collector you want to get detailed information for',
        },
      },
    },
    get_survey: {
      groups: ['Data Retrieval'],
      displayName: 'Get Survey',
      shortDesc: 'Retrieve survey details',
      longDesc: 'Retrieve detailed information about a specific survey including pages and questions',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to retrieve',
          longDesc: 'Select the survey you want to get detailed information for',
        },
      },
    },
    list_surveys: {
      groups: ['Data Retrieval'],
      displayName: 'List Surveys',
      shortDesc: 'Retrieve a list of surveys',
      longDesc: 'Retrieve a paginated list of all surveys in your SurveyMonkey account',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of surveys to return',
          longDesc: 'The maximum total number of surveys to retrieve (default: 500)',
        },
      },
    },
    send_survey: {
      groups: ['Survey Management'],
      displayName: 'Send Survey',
      shortDesc: 'Send survey invitation via collector',
      longDesc: 'Send a survey invitation to recipients via an email collector',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to send',
          longDesc: 'Select the survey you want to send',
        },
        collector_id: {
          displayName: 'Collector',
          shortDesc: 'The email collector to use',
          longDesc: 'Select the email collector to send the survey through',
        },
        subject: {
          displayName: 'Email Subject',
          shortDesc: 'The subject line for the invitation email',
          longDesc: 'The subject line that will appear in the invitation email',
        },
        body_text: {
          displayName: 'Email Body',
          shortDesc: 'The body text for the invitation email',
          longDesc: 'The message body that will appear in the invitation email',
        },
        recipient_emails: {
          displayName: 'Recipient Emails',
          shortDesc: 'List of recipient email addresses',
          longDesc: 'A list of email addresses to send the survey invitation to',
        },
      },
    },
  },
};

export default SurveyMonkeyAppEn;
