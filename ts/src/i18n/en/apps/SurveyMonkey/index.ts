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
    response_disqualified: {
      displayName: 'Response Disqualified',
      shortDesc: 'Triggers when a respondent is disqualified from a survey',
      longDesc:
        'This trigger fires when a respondent is screened out or disqualified from a survey based on their answers to qualifying questions.',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to monitor for disqualified responses',
          longDesc: 'Select the specific survey that you want to monitor for disqualified responses',
        },
      },
    },
    response_updated: {
      displayName: 'Response Updated',
      shortDesc: 'Triggers when a survey response is updated',
      longDesc:
        'This trigger fires when an existing survey response is modified or updated. Useful for tracking partial responses or response edits.',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to monitor for updated responses',
          longDesc: 'Select the specific survey that you want to monitor for updated responses',
        },
      },
    },
    collector_updated: {
      displayName: 'Collector Updated',
      shortDesc: 'Triggers when a collector is updated',
      longDesc:
        'This trigger fires when a collector (distribution method) for a survey is modified, such as status changes or configuration updates.',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to monitor for collector updates',
          longDesc: 'Select the specific survey that you want to monitor for collector changes',
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
    create_survey: {
      groups: ['Survey Management'],
      displayName: 'Create Survey',
      shortDesc: 'Create a new survey',
      longDesc: 'Create a new survey in SurveyMonkey from scratch or from a template',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the survey',
          longDesc: 'The title that will be displayed for the survey',
        },
        nickname: {
          displayName: 'Nickname',
          shortDesc: 'Internal nickname for the survey',
          longDesc: 'An optional internal nickname to help identify the survey',
        },
        language: {
          displayName: 'Language',
          shortDesc: 'The language of the survey',
          longDesc: 'The language code for the survey (e.g., en, es, fr). Defaults to en.',
        },
        folder_id: {
          displayName: 'Folder ID',
          shortDesc: 'The folder to create the survey in',
          longDesc: 'The ID of the folder where the survey should be created',
        },
        from_template_id: {
          displayName: 'Template ID',
          shortDesc: 'Template to create survey from',
          longDesc: 'The ID of a template to use as the basis for the new survey',
        },
      },
    },
    copy_survey: {
      groups: ['Survey Management'],
      displayName: 'Copy Survey',
      shortDesc: 'Create a copy of an existing survey',
      longDesc: 'Clone an existing survey to create a new survey with the same structure and questions',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to copy',
          longDesc: 'Select the survey you want to create a copy of',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title for the new survey',
          longDesc: 'The title that will be displayed for the copied survey',
        },
      },
    },
    update_collector: {
      groups: ['Survey Management'],
      displayName: 'Update Collector',
      shortDesc: 'Update collector settings',
      longDesc: 'Modify the settings of an existing collector such as status, close date, or redirect URL',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey containing the collector',
          longDesc: 'Select the survey that contains the collector',
        },
        collector_id: {
          displayName: 'Collector',
          shortDesc: 'The collector to update',
          longDesc: 'Select the collector you want to modify',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New name for the collector',
          longDesc: 'A new descriptive name for the collector',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The collector status',
          longDesc: 'Set the collector to open or closed',
        },
        close_date: {
          displayName: 'Close Date',
          shortDesc: 'When to automatically close the collector',
          longDesc: 'The date and time when the collector should automatically close (ISO 8601 format)',
        },
        redirect_url: {
          displayName: 'Redirect URL',
          shortDesc: 'URL to redirect respondents after completion',
          longDesc: 'The URL where respondents will be redirected after completing the survey',
        },
        response_limit: {
          displayName: 'Response Limit',
          shortDesc: 'Maximum number of responses',
          longDesc: 'The maximum number of responses to accept before closing the collector',
        },
      },
    },
    delete_collector: {
      groups: ['Survey Management'],
      displayName: 'Delete Collector',
      shortDesc: 'Delete a collector from a survey',
      longDesc: 'Permanently remove a collector from a survey. This action cannot be undone.',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey containing the collector',
          longDesc: 'Select the survey that contains the collector',
        },
        collector_id: {
          displayName: 'Collector',
          shortDesc: 'The collector to delete',
          longDesc: 'Select the collector you want to permanently delete',
        },
      },
    },
    get_response_counts: {
      groups: ['Data Retrieval'],
      displayName: 'Get Response Counts',
      shortDesc: 'Get total response count for a survey',
      longDesc: 'Quickly retrieve the total number of responses for a survey without fetching all response data',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to get counts for',
          longDesc: 'Select the survey you want to get response counts for',
        },
      },
    },
    update_contact: {
      groups: ['Contact Management'],
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact',
      longDesc: 'Modify the details of an existing contact in SurveyMonkey',
      options: {
        contact_id: {
          displayName: 'Contact ID',
          shortDesc: 'The ID of the contact to update',
          longDesc: 'The unique identifier of the contact you want to update',
        },
        first_name: {
          displayName: 'First Name',
          shortDesc: "The contact's first name",
          longDesc: 'The new first name for the contact',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name",
          longDesc: 'The new last name for the contact',
        },
        email: {
          displayName: 'Email',
          shortDesc: "The contact's email address",
          longDesc: 'The new email address for the contact',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: "The contact's phone number",
          longDesc: 'The new phone number for the contact',
        },
      },
    },
    delete_contact: {
      groups: ['Contact Management'],
      displayName: 'Delete Contact',
      shortDesc: 'Delete a contact',
      longDesc: 'Permanently remove a contact from SurveyMonkey. This action cannot be undone.',
      options: {
        contact_id: {
          displayName: 'Contact ID',
          shortDesc: 'The ID of the contact to delete',
          longDesc: 'The unique identifier of the contact you want to delete',
        },
      },
    },
    list_contact_lists: {
      groups: ['Data Retrieval'],
      displayName: 'List Contact Lists',
      shortDesc: 'Retrieve all contact lists',
      longDesc: 'Retrieve a list of all contact lists in your SurveyMonkey account',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of lists to return',
          longDesc: 'The maximum total number of contact lists to retrieve (default: 500)',
        },
      },
    },
    create_contact_list: {
      groups: ['Contact Management'],
      displayName: 'Create Contact List',
      shortDesc: 'Create a new contact list',
      longDesc: 'Create a new contact list for organizing contacts in SurveyMonkey',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'The name of the contact list',
          longDesc: 'A descriptive name for the new contact list',
        },
      },
    },
    add_contacts_to_list: {
      groups: ['Contact Management'],
      displayName: 'Add Contacts to List',
      shortDesc: 'Add contacts to a contact list',
      longDesc: 'Add one or more existing contacts to a contact list in bulk',
      options: {
        contact_list_id: {
          displayName: 'Contact List ID',
          shortDesc: 'The contact list to add contacts to',
          longDesc: 'The ID of the contact list where contacts will be added',
        },
        contact_ids: {
          displayName: 'Contact IDs',
          shortDesc: 'The contacts to add',
          longDesc: 'A list of contact IDs to add to the contact list',
        },
      },
    },
    get_survey_rollup: {
      groups: ['Data Retrieval'],
      displayName: 'Get Survey Rollup',
      shortDesc: 'Get aggregated survey statistics',
      longDesc: 'Retrieve aggregated response statistics for a survey including question-level summaries',
      options: {
        survey_id: {
          displayName: 'Survey',
          shortDesc: 'The survey to get statistics for',
          longDesc: 'Select the survey you want to get aggregated statistics for',
        },
      },
    },
    get_user_details: {
      groups: ['Data Retrieval'],
      displayName: 'Get User Details',
      shortDesc: 'Get authenticated user information',
      longDesc: 'Retrieve details about the authenticated SurveyMonkey user including account type and permissions',
      options: {},
    },
    list_survey_folders: {
      groups: ['Data Retrieval'],
      displayName: 'List Survey Folders',
      shortDesc: 'Retrieve all survey folders',
      longDesc: 'Retrieve a list of all survey folders in your SurveyMonkey account',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of folders to return',
          longDesc: 'The maximum total number of survey folders to retrieve (default: 500)',
        },
      },
    },
    create_survey_folder: {
      groups: ['Survey Management'],
      displayName: 'Create Survey Folder',
      shortDesc: 'Create a new survey folder',
      longDesc: 'Create a new folder to organize your surveys in SurveyMonkey',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the folder',
          longDesc: 'A descriptive title for the new survey folder',
        },
      },
    },
  },
};

export default SurveyMonkeyAppEn;
