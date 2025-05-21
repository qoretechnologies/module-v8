/* eslint-disable max-len */
import type { BaseTranslation } from '../i18n-types';
import { AsanaEventInfo } from './asana/event-info';
import { HubspotAssociationsEn } from './hubspot/associations';
import { HubspotTriggerOptionsEn } from './hubspot/trigger-options';
import { MagentoSearchOptionsEn } from './magento/search-options';
import { StripeTriggerOptionsEn } from './stripe/trigger-options';

const en = {
  common: {},
  apps: {
    _testing: {
      triggers: {
        _testing: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
            },
            option2: {
              displayName: 'Second Option',
              shortDesc: 'Second Option Short Description',
              longDesc: 'Second Option Long Description',
            },
          },
          event_info: {
            desc: 'Event data',
            type: {
              fields: {
                testTriggerInfo: {
                  displayName: 'Test Trigger Info',
                  shortDesc: 'Test Trigger Info Short Description',
                  longDesc: 'Test Trigger Info Long Description',
                  type: {
                    fields: {
                      testTriggerInfo1: {
                        displayName: 'Test Trigger Info 1',
                        shortDesc: 'Test Trigger Info 1 Short Description',
                        longDesc: 'Test Trigger Info 1 Long Description',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      actions: {
        test: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
              type: {
                fields: {
                  subOption1: {
                    displayName: 'Sub Option 1 of option 1',
                    shortDesc: 'Sub Option 1 Short Description',
                    longDesc: 'Sub Option 1 Long Description',
                  },
                  subOption2: {
                    displayName: 'Sub Option 2 of option 1',
                    shortDesc: 'Sub Option 2 Short Description',
                    longDesc: 'Sub Option 2 Long Description',
                    type: {
                      fields: {
                        subSubOption1: {
                          displayName: 'Sub Sub Option 1',
                          shortDesc: 'Sub Sub Option 1 Short Description',
                          longDesc: 'Sub Sub Option 1 Long Description',
                        },
                      },
                    },
                  },
                },
              },
            },
            option2: {
              displayName: 'Second Option',
            },
          },
        },
      },
    },
    GoogleMeet: {
      displayName: 'Google Meet',
      shortDesc: 'Connect with Google Meet to manage your meetings and events',
      longDesc:
        'Integrate with Google Meet to manage your meetings and events. This integration allows you to perform actions and respond to events in your Google Meet account, enabling you to automate meeting management and scheduling workflows.',
      actions: {
        list_conferences: {
          displayName: 'List Conferences',
          shortDesc: 'Retrieves a list of Google Meet conferences with filtering options.',
          longDesc:
            'Retrieves a paginated list of Google Meet conferences with support for filtering by meeting code, time range, and space name. Returns conference details including ID, start time, end time, expiration time, and space information.',
          options: {
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of conferences to return',
              longDesc:
                'The maximum number of conference records to return in a single response. Default is 100.',
            },
            nextPageToken: {
              displayName: 'Next Page Token',
              shortDesc: 'Token for pagination',
              longDesc:
                'A token from a previous response that allows retrieving the next page of results. Leave empty for the first request.',
            },
            meeting_code: {
              displayName: 'Meeting Code',
              shortDesc: 'Filter by meeting code',
              longDesc:
                'Filter results to only include conferences with the specified meeting code.',
            },
            start_time: {
              displayName: 'Start Time',
              shortDesc: 'Filter by start time',
              longDesc:
                'Filter results to only include conferences that started on or after the specified date and time.',
            },
            end_time: {
              displayName: 'End Time',
              shortDesc: 'Filter by end time',
              longDesc:
                'Filter results to only include conferences that ended on or before the specified date and time.',
            },
            space_name: {
              displayName: 'Space Name',
              shortDesc: 'Filter by space name',
              longDesc:
                'Filter results to only include conferences associated with the specified space name.',
            },
          },
        },
        get_conference_participants: {
          displayName: 'Get Conference Participants',
          shortDesc: 'Retrieves participant information for a specific Google Meet conference.',
          longDesc:
            'Retrieves detailed information about participants who attended a specific Google Meet conference. Can filter participants by search term and include time spent metrics.',
          options: {
            conference: {
              displayName: 'Conference',
              shortDesc: 'The Google Meet conference to retrieve participants from',
              longDesc:
                'The identifier or meeting code of the Google Meet conference to retrieve participant information for. Can be either a conference ID or a meeting code in the format XXX-XXXX-XXX.',
            },
            search: {
              displayName: 'Search',
              shortDesc: 'Filter participants by search term',
              longDesc:
                'Optional search term to filter participants by name or other attributes. Only participants matching the search term will be returned.',
            },
            include_time_spent: {
              displayName: 'Include Time Spent',
              shortDesc: 'Include participant time metrics',
              longDesc:
                'When enabled, includes information about how long each participant spent in the conference. Default is true.',
            },
          },
        },
        get_conference_recordings: {
          displayName: 'Get Conference Recordings',
          shortDesc: 'Retrieves recordings for a specific Google Meet conference.',
          longDesc:
            'Retrieves all available recordings associated with a specific Google Meet conference. Returns details about each recording including state, timing information, and storage location.',
          options: {
            conference: {
              displayName: 'Conference',
              shortDesc: 'The Google Meet conference to retrieve recordings from',
              longDesc:
                'The identifier or meeting code of the Google Meet conference to retrieve recording information for. Can be either a conference ID or a meeting code in the format XXX-XXXX-XXX.',
            },
          },
        },
        get_conference_transcript: {
          displayName: 'Get Conference Transcript',
          shortDesc: 'Retrieves a specific transcript from a Google Meet conference.',
          longDesc:
            'Retrieves the detailed content of a specific transcript created for a Google Meet conference. Requires either a conference ID and transcript ID or just a transcript ID if it is already known.',
          options: {
            conference: {
              displayName: 'Conference',
              shortDesc: 'The Google Meet conference containing the transcript',
              longDesc:
                'The identifier or meeting code of the Google Meet conference that contains the transcript. Can be either a conference ID or a meeting code in the format XXX-XXXX-XXX. Optional if the transcript ID is already known.',
            },
            transcript: {
              displayName: 'Transcript',
              shortDesc: 'The transcript to retrieve',
              longDesc:
                'The identifier of the specific transcript to retrieve from the Google Meet conference.',
            },
          },
        },
      },
      triggers: {
        conference_ended: {
          displayName: 'Conference Ended',
          shortDesc: 'Triggers when a Google Meet conference has ended.',
          longDesc:
            'Monitors Google Meet conferences and triggers when a conference has ended. Returns details about the completed conference including name, start time, end time, expiration time, and space information.',
          options: {},
        },
        recording_created: {
          displayName: 'Recording Created',
          shortDesc: 'Triggers when a new recording is created for a Google Meet conference.',
          longDesc:
            'Monitors a specific Google Meet conference and triggers when a new recording has been generated. Returns details about the recording including its name, state, timing information, and Drive destination details.',
          options: {
            conference: {
              displayName: 'Conference',
              shortDesc: 'The Google Meet conference to monitor',
              longDesc:
                'The identifier or meeting code of the Google Meet conference to monitor for new recordings. Can be either a conference ID or a meeting code in the format XXX-XXXX-XXX.',
            },
          },
        },
        transcript_created: {
          displayName: 'Transcript Created',
          shortDesc: 'Triggers when a new transcript is created for a Google Meet conference.',
          longDesc:
            'Monitors a specific Google Meet conference and triggers when a new transcript has been generated. Returns details about the transcript including its name, state, timing information, and Google Docs destination details.',
          options: {
            conference: {
              displayName: 'Conference',
              shortDesc: 'The Google Meet conference to monitor',
              longDesc:
                'The identifier or meeting code of the Google Meet conference to monitor for new transcripts. Can be either a conference ID or a meeting code in the format XXX-XXXX-XXX.',
            },
          },
        },
      },
    },
    GoogleForms: {
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
                    longDesc:
                      'Whether the answer should contain or exactly equal the filter value.',
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
              longDesc:
                'The title of the Google Form. This will be displayed at the top of the form.',
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
                    longDesc:
                      'When enabled, allows setting correct answers and points for questions.',
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
                      longDesc:
                        'For quiz questions, feedback to show respondents after they answer.',
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
    },
    GoogleDrive: {
      displayName: 'Google Drive',
      shortDesc: 'Connect with Google Drive to manage your files and folders',
      longDesc:
        'Integrate with Google Drive to manage your files and folders. This integration allows you to perform actions and respond to events in your Google Drive account, enabling you to automate file management and sharing workflows.',
      triggers: {
        new_file: {
          displayName: 'New File',
          shortDesc: 'Triggers when a new file is added to Google Drive.',
          longDesc:
            'Monitors Google Drive for new files that match your criteria. Can filter by folder, filename, and file type, with options to include file content in the trigger data.',
          options: {
            folder_id: {
              displayName: 'Folder ID',
              shortDesc: 'The Google Drive folder to monitor',
              longDesc:
                'The ID of the Google Drive folder to monitor for new files. If not specified, all files in the drive will be monitored.',
            },
            filename: {
              displayName: 'Filename',
              shortDesc: 'Filter files by name',
              longDesc:
                'Only detect files with names matching this value. Can be used with the search type option to control matching behavior.',
            },
            search_type: {
              displayName: 'Search Type',
              shortDesc: 'How to match filenames',
              longDesc:
                'Determines how the filename filter is applied. "Contains" will match any file containing the specified text, while "Exact Match" requires the complete filename to match.',
            },
            file_types: {
              displayName: 'File Types',
              shortDesc: 'Filter files by MIME type',
              longDesc:
                'Only detect files of the specified MIME types. Multiple types can be selected to include various file formats.',
            },
            include_content: {
              displayName: 'Include Content',
              shortDesc: 'Include file content in the trigger data',
              longDesc:
                'When enabled, the trigger will include the file content in the event data. For text-based files, the content will also be available as plain text. This may increase processing time for large files.',
            },
          },
          event_info: {
            desc: 'Contains information about the newly created Google Drive file, including metadata and optionally the file content.',
          },
        },
        new_folder: {
          displayName: 'New Folder',
          shortDesc: 'Triggers when a new folder is created in Google Drive.',
          longDesc:
            'Monitors Google Drive for newly created folders that match your criteria. You can filter by parent folder and folder name to narrow down the folders being monitored.',
          options: {
            folder_name: {
              displayName: 'Folder Name',
              shortDesc: 'Filter folders by name',
              longDesc:
                'Only detect folders with names matching this value. Can be used with the search type option to control matching behavior.',
            },
            folder_id: {
              displayName: 'Parent Folder ID',
              shortDesc: 'The parent Google Drive folder to monitor',
              longDesc:
                'The ID of the parent Google Drive folder to monitor for new folders. If not specified, all folders across the drive will be monitored.',
            },
            search_type: {
              displayName: 'Search Type',
              shortDesc: 'How to match folder names',
              longDesc:
                'Determines how the folder name filter is applied. "Contains" will match any folder containing the specified text, while "Exact Match" requires the complete folder name to match.',
            },
          },
          event_info: {
            desc: 'Contains information about the newly created Google Drive folder, including metadata such as ID, name, and creation time.',
          },
        },
      },
      actions: {
        add_file_sharing_preference: {
          displayName: 'Add File Sharing Preference',
          shortDesc: 'Set sharing permissions for a Google Drive file',
          longDesc:
            'Modify who can access a file in Google Drive by setting specific sharing preferences. Supports organization-wide sharing, public sharing, and sharing with specific individuals by email.',
          options: {
            file_id: {
              displayName: 'File ID',
              shortDesc: 'ID of the file to share',
              longDesc:
                'The Google Drive file ID of the document, spreadsheet, or other file you want to modify sharing settings for.',
            },
            sharing_preference: {
              displayName: 'Sharing Preference',
              shortDesc: 'How to share the file',
              longDesc:
                'Determines who can access the file and what permissions they have. Choose between organization sharing, public sharing, or sharing with specific individuals.',
            },
            organization_domain: {
              displayName: 'Organization Domain',
              shortDesc: 'Domain for organization sharing',
              longDesc:
                'The domain name of your organization (e.g., example.com). Required when using organization-based sharing options.',
            },
            email_address: {
              displayName: 'Email Address',
              shortDesc: 'Person to share with',
              longDesc:
                'The email address of the specific person you want to share the file with. Required when using email-based sharing.',
            },
            sharing_role: {
              displayName: 'Permission Level',
              shortDesc: 'Access level to grant',
              longDesc:
                'The type of access to grant to the person when sharing via email. Options include viewer (can view), commenter (can comment), or editor (can edit).',
            },
          },
        },
        copy_file: {
          displayName: 'Copy File',
          shortDesc: 'Creates a copy of a Google Drive file with optional parameters.',
          longDesc:
            'Creates a copy of an existing file in Google Drive. Allows you to specify a new name for the copy, ' +
            'place it in a different folder or drive, and optionally convert compatible files to Google Documents format.',
          options: {
            file_id: {
              displayName: 'File',
              shortDesc: 'The file to copy',
              longDesc: 'The ID of the file you want to create a copy of.',
            },
            new_name: {
              displayName: 'New Name',
              shortDesc: 'Name for the new copy',
              longDesc:
                'Name to give to the new file. If not specified, the original file name will be used with "Copy of" prefix.',
            },
            convert_to_document: {
              displayName: 'Convert to Google Document',
              shortDesc: 'Convert file to Google Docs format',
              longDesc:
                'If enabled, compatible files (like .docx, .txt, etc.) will be converted to Google Docs format when copied.',
            },
            folder_id: {
              displayName: 'Folder',
              shortDesc: 'Destination folder',
              longDesc:
                'The folder where the copy should be placed. If not specified, the file will be copied to the root of the selected drive.',
            },
          },
        },
        delete_file: {
          displayName: 'Delete File',
          shortDesc: 'Deletes a file or moves it to trash in Google Drive.',
          longDesc:
            'Removes a file from Google Drive. By default, files are moved to trash and can be recovered later. ' +
            'Set the "permanently delete" option to true to bypass the trash and delete the file permanently.',
          options: {
            file_id: {
              displayName: 'File',
              shortDesc: 'The file to delete',
              longDesc: 'The ID of the file you want to delete from Google Drive.',
            },
            permanently_delete: {
              displayName: 'Permanently Delete',
              shortDesc: 'Skip the trash and delete permanently',
              longDesc:
                'If enabled, the file will be permanently deleted, bypassing the trash. This operation cannot be undone.',
            },
          },
        },
        create_file_from_text: {
          displayName: 'Create File From Text',
          shortDesc: 'Creates a new text file or Google Doc from provided content.',
          longDesc:
            'Creates a new file in Google Drive with the specified text content. ' +
            'You can choose to create a plain text file or convert it directly to a Google Document. ' +
            'The file can be placed in a specific folder or in the root of your drive.',
          options: {
            folder_id: {
              displayName: 'Folder',
              shortDesc: 'Location for the new file',
              longDesc:
                'The folder where the new file should be created. If not specified, the file will be created in the root of your drive.',
            },
            file_name: {
              displayName: 'File Name',
              shortDesc: 'Name for the new file',
              longDesc:
                'The name to give to the new file, including any extension (e.g., "notes.txt").',
            },
            file_content: {
              displayName: 'File Content',
              shortDesc: 'Text content for the file',
              longDesc:
                'The text content to be written to the file. This can include plain text, formatted text, or markdown (if converting to a Google Document).',
            },
            convert_to_document: {
              displayName: 'Convert to Google Document',
              shortDesc: 'Create as Google Doc instead of text file',
              longDesc:
                'If enabled, the content will be used to create a Google Document instead of a plain text file. This allows for rich text formatting.',
            },
          },
        },
        create_folder: {
          displayName: 'Create Folder',
          shortDesc: 'Creates a new folder in Google Drive.',
          longDesc:
            'Creates a new folder in Google Drive. You can specify a parent folder where the new folder ' +
            'should be created, or leave it blank to create the folder in the root of your Drive.',
          options: {
            parent_folder_id: {
              displayName: 'Parent Folder',
              shortDesc: 'Location for the new folder',
              longDesc:
                'The folder where the new folder should be created. If not specified, the folder will be created in the root of your Drive.',
            },
            folder_name: {
              displayName: 'Folder Name',
              shortDesc: 'Name for the new folder',
              longDesc: 'The name to give to the new folder.',
            },
          },
        },
        create_shortcut: {
          displayName: 'Create Shortcut',
          shortDesc: 'Creates a shortcut to a file in a specific folder.',
          longDesc:
            'Creates a shortcut (link) to an existing file in Google Drive. The shortcut will be placed in the specified folder. ' +
            'Shortcuts allow you to organize files without creating duplicates, giving you access to the same file from multiple locations.',
          options: {
            file_id: {
              displayName: 'Target File',
              shortDesc: 'File to create a shortcut to',
              longDesc:
                'The file that the shortcut will point to. This file will remain in its original location.',
            },
            folder_id: {
              displayName: 'Destination Folder',
              shortDesc: 'Folder to place the shortcut in',
              longDesc: 'The folder where the new shortcut will be created.',
            },
            shortcut_name: {
              displayName: 'Shortcut Name',
              shortDesc: 'Custom name for the shortcut (optional)',
              longDesc:
                'Optional custom name for the shortcut. If not provided, the original file name will be used.',
            },
          },
        },
        move_file: {
          displayName: 'Move File',
          shortDesc: 'Moves a file to a different folder in Google Drive.',
          longDesc:
            'Moves a file from its current location to a different folder in Google Drive. ' +
            'You can optionally keep the file in its original location(s), which effectively creates a copy ' +
            'of the file in the new location while maintaining the original.',
          options: {
            file_id: {
              displayName: 'File',
              shortDesc: 'File to move',
              longDesc: 'The file that you want to move to a different folder.',
            },
            folder_id: {
              displayName: 'Destination Folder',
              shortDesc: 'Folder to move the file to',
              longDesc: 'The folder where you want to move the file to.',
            },
            keep_in_original_folders: {
              displayName: 'Keep in Original Folders',
              shortDesc: 'Keep file in original locations',
              longDesc:
                'If enabled, the file will remain in its original folder(s) and also be added to the destination folder. If disabled (default), the file will be removed from its original location(s).',
            },
          },
        },
        replace_file: {
          displayName: 'Replace File',
          shortDesc: 'Replace an existing file in Google Drive with a new one.',
          longDesc:
            'Uploads a new file to Google Drive to replace an existing file. The original file ID is preserved, but its contents and optionally name and extension are updated.',
          options: {
            file_to_replace: {
              displayName: 'File to Replace',
              shortDesc: 'The file that will be replaced',
              longDesc:
                'The ID of the existing Google Drive file that you want to replace with new content.',
            },
            file: {
              displayName: 'New File',
              shortDesc: 'The new file to upload',
              longDesc: 'The file content that will replace the existing file in Google Drive.',
            },
            file_name: {
              displayName: 'File Name',
              shortDesc: 'Optional new name for the file',
              longDesc:
                'A new name for the file. If not provided, the original name of the uploaded file will be used.',
            },
            file_extension: {
              displayName: 'File Extension',
              shortDesc: 'Optional new file extension',
              longDesc:
                'A new extension for the file. This will also update the file MIME type if a known extension is provided.',
            },
          },
        },
        list_files: {
          displayName: 'List Files',
          shortDesc: 'Retrieve files from Google Drive with filtering and sorting options.',
          longDesc:
            'Fetches a list of files from Google Drive with support for various filters, custom queries, sorting, and pagination.',
          options: {
            filename: {
              displayName: 'Filename',
              shortDesc: 'Filter by filename',
              longDesc:
                'Filter results to files whose names match the specified value, based on the selected search type.',
            },
            search_type: {
              displayName: 'Search Type',
              shortDesc: 'How to match the filename',
              longDesc:
                'Specify whether to search for files with names that contain the specified text or that exactly match it.',
            },
            folder: {
              displayName: 'Folder',
              shortDesc: 'Filter by parent folder',
              longDesc:
                'Filter results to only include files that are contained within the specified folder.',
            },
            file_types: {
              displayName: 'File Types',
              shortDesc: 'Filter by file types',
              longDesc:
                'Filter results to only include files of the specified types. Multiple types can be selected.',
            },
            order_by: {
              displayName: 'Order By',
              shortDesc: 'Fields and directions to sort results by',
              longDesc:
                'Specify how to sort the returned files. You can add multiple sorting criteria, each with a field and direction.',
              type: {
                fields: {
                  field: {
                    displayName: 'Field',
                    shortDesc: 'Field to sort by',
                    longDesc:
                      'The file property to use for sorting, such as name, creation time, or modification time.',
                  },
                  direction: {
                    displayName: 'Direction',
                    shortDesc: 'Sort direction',
                    longDesc:
                      'The direction to sort in, either ascending (asc) or descending (desc).',
                  },
                },
              },
            },
            page_size: {
              displayName: 'Page Size',
              shortDesc: 'Maximum number of files to return',
              longDesc:
                'The maximum number of files to return in a single request. Default is 100. Maximum allowed is 1000.',
            },
            custom_query: {
              displayName: 'Custom Query',
              shortDesc: 'Advanced search query to filter results',
              longDesc: 'Specify a custom search query to filter the results.',
            },
          },
        },
        upload_file: {
          displayName: 'Upload File',
          shortDesc:
            'Upload a file to Google Drive with optional conversion to Google Docs format.',
          longDesc:
            'Uploads a file to a specific folder in Google Drive with options to customize the file name, format, and convert to Google Docs format when applicable.',
          options: {
            folder: {
              displayName: 'Folder',
              shortDesc: 'Google Drive folder to upload the file to',
              longDesc:
                'The ID of the Google Drive folder where the file will be uploaded. Required.',
            },
            file: {
              displayName: 'File',
              shortDesc: 'File to upload',
              longDesc: 'The file to be uploaded to Google Drive. Required.',
            },
            convert_to_document: {
              displayName: 'Convert to Google Format',
              shortDesc: 'Convert file to Google Docs format when possible',
              longDesc:
                'When enabled, compatible files (documents, spreadsheets, presentations, etc.) will be converted to their equivalent Google Workspace formats.',
            },
            file_name: {
              displayName: 'File Name',
              shortDesc: 'Custom file name (optional)',
              longDesc:
                'Optional custom name for the file. If not provided, the original file name will be used.',
            },
            file_extension: {
              displayName: 'File Extension',
              shortDesc: 'Change file extension (optional)',
              longDesc:
                'Optional file extension to change the format of the file. Only applies when custom file name is provided.',
            },
          },
        },
        find_or_create_file: {
          displayName: 'Find or Create File',
          shortDesc: 'Search for a file in Google Drive and optionally create it if not found.',
          longDesc:
            'Searches for a file in Google Drive with options for exact or partial name matching, folder filtering, and file type filtering. If the file is not found, it can optionally create a new file with the provided content.',
          options: {
            filename: {
              displayName: 'File Name',
              shortDesc: 'Name of the file to search for',
              longDesc: 'The name of the file to search for in Google Drive. Required.',
            },
            search_type: {
              displayName: 'Search Type',
              shortDesc: 'How to match the filename',
              longDesc:
                'Choose between "contains" (partial match) or "exact" (exact match) for the filename search. Default is "contains".',
            },
            folder: {
              displayName: 'Folder',
              shortDesc: 'Limit search to specific folder (optional)',
              longDesc: 'Optional Google Drive folder ID to limit the search to a specific folder.',
            },
            file_types: {
              displayName: 'File Types',
              shortDesc: 'Filter by file types (optional)',
              longDesc: 'Optional list of MIME types to filter the search results by file type.',
            },
            create_if_not_exists: {
              displayName: 'Create If Not Found',
              shortDesc: 'Create the file if not found',
              longDesc:
                'When enabled, if the file is not found, a new file will be created with the provided content.',
            },
            file: {
              displayName: 'File Content',
              shortDesc: 'Content for the new file if created',
              longDesc:
                'The file content to use when creating a new file if the search does not find a match.',
            },
            convert_to_document: {
              displayName: 'Convert to Google Format',
              shortDesc: 'Convert file to Google Docs format when possible',
              longDesc:
                'When enabled, compatible files (documents, spreadsheets, presentations, etc.) will be converted to their equivalent Google Workspace formats when created.',
            },
            file_extension: {
              displayName: 'File Extension',
              shortDesc: 'Specify file extension for the new file',
              longDesc: 'Optional file extension to specify the format of the new file if created.',
            },
          },
        },
        find_or_create_folder: {
          displayName: 'Find or Create Folder',
          shortDesc: 'Search for a folder in Google Drive and optionally create it if not found.',
          longDesc:
            'Searches for a folder in Google Drive with options for exact or partial name matching and parent folder filtering. If the folder is not found, it can optionally create a new folder with the specified name.',
          options: {
            folder_name: {
              displayName: 'Folder Name',
              shortDesc: 'Name of the folder to search for',
              longDesc: 'The name of the folder to search for in Google Drive. Required.',
            },
            search_type: {
              displayName: 'Search Type',
              shortDesc: 'How to match the folder name',
              longDesc:
                'Choose between "contains" (partial match) or "exact" (exact match) for the folder name search. Default is "contains".',
            },
            parent_folder: {
              displayName: 'Parent Folder',
              shortDesc: 'Limit search to a specific parent folder (optional)',
              longDesc:
                'Optional Google Drive folder ID to limit the search to folders within a specific parent folder.',
            },
            create_if_not_exists: {
              displayName: 'Create If Not Found',
              shortDesc: 'Create the folder if not found',
              longDesc:
                'When enabled, if the folder is not found, a new folder will be created with the specified name.',
            },
          },
        },
        get_file: {
          displayName: 'Get File by ID',
          shortDesc: 'Retrieves a single file from Google Drive by its ID with detailed metadata.',
          longDesc:
            'Fetches a file from Google Drive using its unique ID, returning comprehensive metadata and optionally the file content. Supports retrieving Google Docs with various export format options.',
          options: {
            file_id: {
              displayName: 'File ID',
              shortDesc: 'The unique ID of the Google Drive file to retrieve',
              longDesc:
                'The Google Drive file ID. This is the unique identifier found in the URL when viewing a file in Google Drive.',
            },
            include_content: {
              displayName: 'Include Content',
              shortDesc: 'Include the file content in the response',
              longDesc:
                'When enabled, retrieves the file content and returns it encoded in base64 format. For text files, also attempts to provide the content as plain text. This may increase response time for larger files.',
            },
            convert_export_format: {
              displayName: 'Export Format',
              shortDesc: 'Format to export Google Docs files',
              longDesc:
                'For Google Workspace files (Docs, Sheets, Slides, etc.), specifies the format to export the file. Only applicable when Include Content is enabled and the file is a Google Workspace document.',
            },
          },
        },
        get_folder: {
          displayName: 'Get Folder by ID',
          shortDesc: 'Retrieves a folder from Google Drive by its ID with detailed metadata.',
          longDesc:
            'Fetches a folder from Google Drive using its unique ID, returning comprehensive metadata and optionally a list of its immediate children (files and subfolders).',
          options: {
            folder_id: {
              displayName: 'Folder ID',
              shortDesc: 'The unique ID of the Google Drive folder to retrieve',
              longDesc:
                'The Google Drive folder ID. This is the unique identifier found in the URL when viewing a folder in Google Drive.',
            },
            include_children: {
              displayName: 'Include Children',
              shortDesc: "Include the folder's immediate children in the response",
              longDesc:
                'When enabled, retrieves the list of files and subfolders directly contained in this folder. Each child includes basic metadata such as name, ID, type, and modification dates.',
            },
            children_limit: {
              displayName: 'Children Limit',
              shortDesc: 'Maximum number of children to return',
              longDesc:
                'Limits the number of children items returned when Include Children is enabled. The response will indicate if there are more children beyond this limit. Default is 100.',
            },
          },
        },
      },
    },
    GoogleSheets: {
      displayName: 'Google Sheets',
      shortDesc: 'Connect with Google Sheets to manage your spreadsheets',
      longDesc:
        'Integrate with Google Sheets to create, update, and manage your spreadsheets. This integration allows you to perform actions and respond to events in your Google Sheets account, enabling you to automate data management and reporting workflows.',
      triggers: {
        new_spreadsheet_row: {
          displayName: 'New Spreadsheet Row',
          shortDesc: 'Triggers when a new row is added to a Google Sheet.',
          longDesc:
            'Monitors a specific sheet in a Google Spreadsheet and triggers when new rows are added. The trigger provides the row data with column headers as field names.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet ID',
              shortDesc: 'The ID of the Google Spreadsheet to monitor',
              longDesc:
                'The unique identifier of the Google Spreadsheet that contains the sheet you want to monitor for new rows.',
            },
            sheet_id: {
              displayName: 'Sheet ID',
              shortDesc: 'The ID of the specific sheet to monitor',
              longDesc:
                'The unique identifier of the specific sheet within the spreadsheet that you want to monitor for new rows. The sheet ID can be found in the spreadsheet URL.',
            },
          },
          event_info: {
            desc: 'Information about a newly added row in a Google Sheet',
          },
        },
        new_spreadsheet_sheet: {
          displayName: 'New Spreadsheet Sheet',
          shortDesc: 'Triggers when a new sheet is added to a Google Spreadsheet.',
          longDesc:
            'Monitors a Google Spreadsheet and triggers when new sheets are added. The trigger provides metadata about the newly created sheet including its ID, title, index position, and dimensions.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet ID',
              shortDesc: 'The ID of the Google Spreadsheet to monitor',
              longDesc:
                'The unique identifier of the Google Spreadsheet that you want to monitor for new sheets. The spreadsheet ID can be found in the spreadsheet URL.',
            },
          },
          event_info: {
            desc: 'Information about a newly added sheet in a Google Spreadsheet',
          },
        },
        new_spreadsheet: {
          displayName: 'New Spreadsheet',
          shortDesc: 'Triggers when a new Google Spreadsheet is created.',
          longDesc:
            'Monitors Google Drive for newly created Google Spreadsheets. The trigger provides metadata about the newly created spreadsheet including its ID, name, URL, creation time, and owner information.',
          event_info: {
            desc: 'Information about a newly created Google Spreadsheet',
          },
        },
      },
      actions: {
        find_spreadsheet_rows: {
          displayName: 'Find Spreadsheet Rows',
          shortDesc: 'Search for rows in a Google Sheets spreadsheet that match specific criteria.',
          longDesc:
            'Searches for rows in a Google Sheet that match a specific value in a designated column. Supports searching by column header or letter, pagination, and different response formats.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet ID',
              shortDesc: 'ID of the Google Sheets spreadsheet',
              longDesc:
                'The unique identifier of the Google Sheets spreadsheet to search in. This can be found in the URL of the spreadsheet.',
            },
            sheet_id: {
              displayName: 'Sheet ID',
              shortDesc: 'ID of the specific sheet within the spreadsheet',
              longDesc:
                'The ID of the specific sheet to search within the spreadsheet. Each sheet has a unique ID that can be selected from the available sheets.',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of matching rows to return',
              longDesc:
                'The maximum number of matching rows to include in the results. Default is 10.',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of matching rows to skip',
              longDesc:
                'The number of matching rows to skip before returning results. Used for pagination. Default is 0.',
            },
            search_from_last_row: {
              displayName: 'Search From Last Row',
              shortDesc: 'Start searching from the bottom of the sheet',
              longDesc:
                'When enabled, searches from the bottom of the sheet upward instead of from the top down. Useful for finding the most recent entries in sheets where new data is appended at the bottom.',
            },
            max_rows_to_search: {
              displayName: 'Maximum Rows to Search',
              shortDesc: 'Maximum number of rows to search through',
              longDesc:
                'Limits the total number of rows to search to control performance with large sheets. Default is 5000.',
            },
            response_type: {
              displayName: 'Response Format',
              shortDesc: 'Format of the returned rows',
              longDesc:
                'Determines how the matched rows are formatted in the response. Options include raw values, values mapped to column headers, or values mapped to column letters.',
            },
            search: {
              displayName: 'Search Criteria',
              shortDesc: 'Criteria for finding matching rows',
              longDesc: 'Defines the search criteria to use when looking for matching rows.',
              type: {
                fields: {
                  header: {
                    displayName: 'Column Header',
                    shortDesc: 'Header of the column to search in',
                    longDesc:
                      'The header text of the column to search in. Use this or Column Letter, not both.',
                  },
                  column: {
                    displayName: 'Column Letter',
                    shortDesc: 'Letter of the column to search in (A, B, C, etc.)',
                    longDesc:
                      'The letter designation of the column to search in (e.g., A, B, C). Use this or Column Header, not both.',
                  },
                  value: {
                    displayName: 'Search Value',
                    shortDesc: 'Value to search for',
                    longDesc:
                      'The value to look for in the specified column. Rows with this exact value will be returned.',
                  },
                },
              },
            },
          },
        },
        search_worksheets: {
          displayName: 'Search Worksheets',
          shortDesc: 'Find worksheets within a Google Spreadsheet by title.',
          longDesc:
            'Searches for worksheets (tabs) within a Google Spreadsheet by their titles. Returns detailed information about matching worksheets including dimensions, position, and visibility. Can be used to find specific worksheets or list all worksheets in a spreadsheet.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet ID',
              shortDesc: 'The ID of the Google Spreadsheet to search within',
              longDesc:
                'The unique identifier of the Google Spreadsheet you want to search for worksheets in. This can be found in the spreadsheet URL.',
            },
            title: {
              displayName: 'Sheet Title',
              shortDesc: 'Title text to search for (case-insensitive)',
              longDesc:
                'Search for worksheets with titles containing this text. Leave empty to list all worksheets in the spreadsheet. The search is case-insensitive by default.',
            },
            exact_match: {
              displayName: 'Exact Match',
              shortDesc: 'Whether to match the title exactly',
              longDesc:
                'If enabled, only worksheets with exactly matching titles will be returned. If disabled (default), worksheets with titles containing the search text will be included in the results.',
            },
          },
        },
        update_spreadsheet_rows: {
          displayName: 'Update Spreadsheet Rows',
          shortDesc: 'Update existing rows in a Google Sheets spreadsheet.',
          longDesc:
            'Updates specific rows in a Google Sheets spreadsheet by their row indices. This action allows you to modify multiple rows in a single operation while preserving the spreadsheet structure.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet ID',
              shortDesc: 'The ID of the Google Sheets spreadsheet.',
              longDesc:
                'The unique identifier of the Google Sheets spreadsheet you want to update rows in. This can be found in the spreadsheet URL.',
            },
            sheet_id: {
              displayName: 'Sheet ID',
              shortDesc: 'The ID of the sheet within the spreadsheet.',
              longDesc:
                'The unique identifier of the specific sheet within the spreadsheet where rows will be updated.',
            },
            rows: {
              displayName: 'Rows to Update',
              shortDesc: 'List of rows with their indices and data to update.',
              longDesc:
                'A list of rows to update, each containing a row index (starting from 2, as row 1 contains headers) and the data to update in that row. The data should match the headers in the spreadsheet.',
              type: {
                fields: {
                  row_index: {
                    displayName: 'Row Index',
                    shortDesc: 'The index of the row to update.',
                    longDesc:
                      'The row number to update, starting from 2 (row 1 is reserved for headers). This number must refer to an existing row in the spreadsheet.',
                  },
                },
              },
            },
          },
        },
        format_spreadsheet_rows: {
          displayName: 'Format Spreadsheet Rows',
          shortDesc: 'Apply formatting to specific rows in a Google Sheets spreadsheet.',
          longDesc:
            'Apply various formatting options such as colors, text styles, and alignment to specified rows in a Google Sheets spreadsheet. Format multiple rows at once with consistent styling.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'The ID of the Google Sheets spreadsheet to format',
              longDesc:
                'The ID of the Google Sheets spreadsheet containing the rows to format. This can be found in the spreadsheet URL.',
            },
            sheet_id: {
              displayName: 'Worksheet',
              shortDesc: 'The ID of the specific worksheet within the spreadsheet',
              longDesc:
                'The ID of the specific worksheet (tab) containing the rows to format. Each worksheet has a unique ID within a spreadsheet.',
            },
            rows: {
              displayName: 'Rows',
              shortDesc: 'List of row numbers to format',
              longDesc:
                'List of row numbers to format (1-based indexing). For example, [1, 2, 5] will format the first, second, and fifth rows.',
            },
            background_color: {
              displayName: 'Background Color',
              shortDesc: 'Background color for the cells',
              longDesc:
                'The background color to apply to the cells in the specified rows. Uses RGB color format.',
            },
            text_color: {
              displayName: 'Text Color',
              shortDesc: 'Color for the text in the cells',
              longDesc:
                'The color to apply to the text in the cells of the specified rows. Uses RGB color format.',
            },
            bold: {
              displayName: 'Bold',
              shortDesc: 'Make text bold',
              longDesc: 'Whether to make the text in the specified rows bold.',
            },
            italic: {
              displayName: 'Italic',
              shortDesc: 'Make text italic',
              longDesc: 'Whether to make the text in the specified rows italic.',
            },
            strikethrough: {
              displayName: 'Strikethrough',
              shortDesc: 'Apply strikethrough to text',
              longDesc:
                'Whether to apply strikethrough formatting to the text in the specified rows.',
            },
            underline: {
              displayName: 'Underline',
              shortDesc: 'Underline the text',
              longDesc: 'Whether to underline the text in the specified rows.',
            },
            horizontal_alignment: {
              displayName: 'Horizontal Alignment',
              shortDesc: 'Horizontal alignment of content',
              longDesc:
                'The horizontal alignment to apply to the content in the specified rows (Left, Center, or Right).',
            },
            vertical_alignment: {
              displayName: 'Vertical Alignment',
              shortDesc: 'Vertical alignment of content',
              longDesc:
                'The vertical alignment to apply to the content in the specified rows (Top, Middle, or Bottom).',
            },
            font_size: {
              displayName: 'Font Size',
              shortDesc: 'Text font size in points',
              longDesc: 'The font size in points to apply to the text in the specified rows.',
            },
            wrap_text: {
              displayName: 'Wrap Text',
              shortDesc: 'Whether to wrap text in cells',
              longDesc:
                'If enabled, text will wrap within cells rather than overflowing into adjacent cells.',
            },
          },
        },
        delete_row: {
          displayName: 'Delete Row',
          shortDesc: 'Delete a specific row from a Google Sheets worksheet.',
          longDesc:
            'Completely removes a row from a specified Google Sheets worksheet without leaving an empty space behind. The row indexing starts from 1, matching what you see in the spreadsheet UI.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'The Google Sheets spreadsheet containing the row to delete',
              longDesc:
                'The ID of the Google Sheets spreadsheet that contains the worksheet with the row to delete.',
            },
            sheet_id: {
              displayName: 'Worksheet',
              shortDesc: 'The worksheet containing the row to delete',
              longDesc:
                'The ID of the worksheet (tab) within the spreadsheet that contains the row to delete.',
            },
            row_index: {
              displayName: 'Row Index',
              shortDesc: 'The index of the row to delete (starting from 1)',
              longDesc:
                'The position of the row to delete, starting from 1 (not 0). This matches the row numbers you see in the Google Sheets UI. For example, to delete the very first row, use 1.',
            },
          },
        },
        create_worksheet: {
          displayName: 'Create Worksheet',
          shortDesc: 'Create a new worksheet in a Google Sheets spreadsheet with optional headers.',
          longDesc:
            'Creates a new worksheet (tab) in a specified Google Sheets spreadsheet with custom title and optional column headers. Can optionally overwrite an existing worksheet with the same name.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'The Google Sheets spreadsheet where the worksheet will be created',
              longDesc:
                'The ID of the Google Sheets spreadsheet in which to create the new worksheet.',
            },
            title: {
              displayName: 'Worksheet Title',
              shortDesc: 'Title for the new worksheet',
              longDesc: 'The name that will appear on the tab of the new worksheet.',
            },
            overwrite_existing: {
              displayName: 'Overwrite Existing',
              shortDesc: 'Whether to replace an existing worksheet with the same title',
              longDesc:
                'If true and a worksheet with the same title already exists, the existing worksheet will be deleted and replaced. If false and a duplicate exists, the action will fail.',
            },
            headers: {
              displayName: 'Headers',
              shortDesc: 'Column headers to add to the first row',
              longDesc:
                'A list of column headers that will be added to the first row of the new worksheet and formatted in bold.',
            },
            insert_sheet_index: {
              displayName: 'Sheet Position',
              shortDesc: 'Position where the new worksheet should be placed',
              longDesc:
                'The position (zero-based index) where the new worksheet should be inserted in the spreadsheet. If not specified, the worksheet will be added at the end.',
            },
          },
        },
        create_spreadsheet_column: {
          displayName: 'Create Spreadsheet Column',
          shortDesc: 'Insert a new column into a Google Sheets spreadsheet.',
          longDesc:
            'Inserts a new column at the specified position in a Google Sheets spreadsheet and adds a formatted header at the top of the column.',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'The Google Sheets spreadsheet',
              longDesc: 'The ID of the Google Sheets spreadsheet where the column will be created.',
            },
            sheet_id: {
              displayName: 'Sheet',
              shortDesc: 'The sheet within the spreadsheet',
              longDesc:
                'The ID of the specific sheet within the spreadsheet where the column will be added.',
            },
            column_title: {
              displayName: 'Column Title',
              shortDesc: 'The title for the new column',
              longDesc: 'The header text that will appear at the top of the new column.',
            },
            column_index: {
              displayName: 'Column Index',
              shortDesc: 'The position where the column will be inserted',
              longDesc:
                'Zero-based index of the position where the new column should be inserted. For example, 0 means the column will be inserted at the beginning of the sheet, 1 means after the first column, etc.',
            },
          },
        },
        create_spreadsheet: {
          displayName: 'Create Spreadsheet',
          shortDesc:
            'Create a new Google Sheets spreadsheet with optional headers or by copying an existing one.',
          longDesc:
            'Creates a new Google Sheets spreadsheet. You can either create it from scratch with custom headers or copy an existing spreadsheet. When headers are provided, they are formatted as bold with borders and the header row is frozen.',
          options: {
            title: {
              displayName: 'Spreadsheet Title',
              shortDesc: 'The title for the new spreadsheet',
              longDesc:
                'The name that will be given to the newly created Google Sheets spreadsheet.',
            },
            source_spreadsheet_id: {
              displayName: 'Source Spreadsheet',
              shortDesc: 'ID of an existing spreadsheet to copy',
              longDesc:
                'Optional. If provided, the new spreadsheet will be created as a copy of this existing spreadsheet. Headers option will be ignored if this is provided.',
            },
            headers: {
              displayName: 'Headers',
              shortDesc: 'Column headers for the new spreadsheet',
              longDesc:
                'Optional. A list of column headers to add to the first row of the new spreadsheet. Headers will be formatted as bold with borders and the header row will be frozen. This option is ignored if a source spreadsheet is provided.',
            },
          },
        },
        add_spreadsheet_rows: {
          displayName: 'Add Rows to Spreadsheet',
          shortDesc: 'Add one or more rows to the end of a Google Sheets table',
          longDesc:
            'Append new rows to an existing Google Sheets table with data mapped to the table headers',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'Select the Google Sheets spreadsheet',
              longDesc: 'The Google Sheets spreadsheet where you want to add rows',
            },
            sheet_id: {
              displayName: 'Worksheet',
              shortDesc: 'Select the worksheet within the spreadsheet',
              longDesc:
                'The specific worksheet within the spreadsheet where the rows will be added',
            },
            insert_at_start: {
              displayName: 'Insert at Start',
              shortDesc: 'Insert rows at the start of the table',
              longDesc:
                'If selected, new rows will be inserted at the start of the table. If not selected, rows will be appended to the end of the table.',
            },
            rows: {
              displayName: 'Rows to Add',
              shortDesc: 'The data to add as new rows',
              longDesc:
                'Specify the data for each row to add. Values should match the headers in the first row of the sheet. Each row is a set of key-value pairs where keys are column headers and values are the data to insert.',
            },
          },
        },
        copy_worksheet: {
          displayName: 'Copy Worksheet',
          shortDesc: 'Copy a worksheet from one Google Sheets spreadsheet to another',
          longDesc:
            'Create a copy of a worksheet from a source spreadsheet to a destination spreadsheet with optional customization',
          options: {
            source_spreadsheet_id: {
              displayName: 'Source Spreadsheet',
              shortDesc: 'Select the source Google Sheets spreadsheet',
              longDesc: 'The Google Sheets spreadsheet containing the worksheet you want to copy',
            },
            source_sheet_id: {
              displayName: 'Source Worksheet',
              shortDesc: 'Select the worksheet to copy',
              longDesc: 'The specific worksheet within the source spreadsheet that will be copied',
            },
            destination_spreadsheet_id: {
              displayName: 'Destination Spreadsheet',
              shortDesc: 'Select the destination Google Sheets spreadsheet',
              longDesc: 'The Google Sheets spreadsheet where the worksheet will be copied to',
            },
            new_sheet_name: {
              displayName: 'New Worksheet Name',
              shortDesc: 'Optional new name for the copied worksheet',
              longDesc:
                'Specify a custom name for the copied worksheet. If not provided, the original name will be used with "Copy of" prefix',
            },
            insert_sheet_index: {
              displayName: 'Insert Position',
              shortDesc: 'Optional position to insert the new worksheet',
              longDesc:
                'The zero-based index where the new worksheet should be inserted. If not specified, the worksheet is added to the end of the spreadsheet',
            },
          },
        },
        clear_spreadsheet_rows: {
          displayName: 'Clear Spreadsheet Row(s)',
          shortDesc: 'Clear content from specific rows in a Google Sheets spreadsheet',
          longDesc:
            'Remove all data from selected rows in a Google Sheets spreadsheet while preserving formatting',
          options: {
            spreadsheet_id: {
              displayName: 'Spreadsheet',
              shortDesc: 'Select the Google Sheets spreadsheet',
              longDesc: 'The Google Sheets spreadsheet containing the rows to be cleared',
            },
            sheet_id: {
              displayName: 'Sheet',
              shortDesc: 'Select the sheet within the spreadsheet',
              longDesc: 'The specific sheet within the spreadsheet where rows will be cleared',
            },
            rows: {
              displayName: 'Rows to Clear',
              shortDesc: 'The row numbers to clear (1-based)',
              longDesc:
                'Specify which rows to clear. Row numbers start at 1 as seen in the spreadsheet. For example, [1, 3, 5] will clear rows 1, 3, and 5.',
            },
          },
        },
      },
    },
    Attio: {
      displayName: 'Attio',
      shortDesc: 'Connect with Attio to manage your contacts and data',
      longDesc:
        'Integrate with Attio to manage your contacts, companies, and data. This integration allows you to perform actions and respond to events in your Attio workspace, enabling you to automate workflows and enhance your productivity.',
      triggers: {
        list_entry_created: {
          displayName: 'New List Entry Created',
          shortDesc: 'Triggers when a new entry is created in an Attio list.',
          longDesc:
            'This trigger fires whenever a new entry is created in a specified Attio list. It provides details about the created entry including its ID, parent object, and the actor who created it.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to monitor for new entries',
              longDesc: 'The API slug of the Attio list to monitor for new entries.',
            },
          },
        },
        list_entry_updated: {
          displayName: 'List Entry Updated',
          shortDesc: 'Triggers when an entry is updated in an Attio list.',
          longDesc:
            'This trigger fires whenever an entry is updated in a specified Attio list. It provides details about the updated entry including its ID, parent object, the actor who made the update, and the specific changes that were made.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to monitor for updated entries',
              longDesc: 'The API slug of the Attio list to monitor for updated entries.',
            },
          },
        },
        list_entry_deleted: {
          displayName: 'List Entry Deleted',
          shortDesc: 'Triggers when an entry is deleted from an Attio list.',
          longDesc:
            'This trigger fires whenever an entry is deleted from a specified Attio list. It provides details about the deleted entry including its ID, parent object, and the actor who performed the deletion.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to monitor for deleted entries',
              longDesc: 'The API slug of the Attio list to monitor for deleted entries.',
            },
          },
        },
        object_record_created: {
          displayName: 'New Object Record Created',
          shortDesc: 'Triggers when a new record is created for an Attio object.',
          longDesc:
            'This trigger fires whenever a new record is created for a specified Attio object. It provides details about the created record including its ID, object type, and the actor who created it.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Attio object to monitor for new records',
              longDesc: 'The API slug of the Attio object type to monitor for new records.',
            },
          },
        },
        object_record_updated: {
          displayName: 'Object Record Updated',
          shortDesc: 'Triggers when a record is updated for an Attio object.',
          longDesc:
            'This trigger fires whenever a record is updated for a specified Attio object. It provides details about the updated record including its ID, object type, the actor who made the update, and the specific changes that were made.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Attio object to monitor for updated records',
              longDesc: 'The API slug of the Attio object type to monitor for updated records.',
            },
          },
        },
        object_record_deleted: {
          displayName: 'Object Record Deleted',
          shortDesc: 'Triggers when a record is deleted from an Attio object.',
          longDesc:
            'This trigger fires whenever a record is deleted from a specified Attio object. It provides details about the deleted record including its ID, object type, and the actor who performed the deletion.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Attio object to monitor for deleted records',
              longDesc: 'The API slug of the Attio object type to monitor for deleted records.',
            },
          },
        },
        task_created: {
          displayName: 'New Task Created',
          shortDesc: 'Triggers when a new task is created in Attio.',
          longDesc:
            'This trigger fires whenever a new task is created in your Attio workspace. It provides details about the created task including its ID, title, description, assignees, due date, and the actor who created it.',
        },
      },
      actions: {
        create_note: {
          displayName: 'Create Note',
          shortDesc: 'Creates a new note attached to a specific record in Attio.',
          longDesc:
            'This action creates a new note and attaches it to a specific record within an Attio object. Notes can be written in plain text or markdown format and include a title and content body. They serve as a way to document important information about records in your workspace.',
          options: {
            parent_object: {
              displayName: 'Parent Object',
              shortDesc: 'The object that contains the record to attach the note to',
              longDesc:
                'Select the Attio object that contains the record you want to attach this note to. This defines which object type the note will be associated with.',
            },
            parent_record_id: {
              displayName: 'Parent Record ID',
              shortDesc: 'The specific record to attach the note to',
              longDesc:
                'Select the specific record within the parent object that this note should be attached to. Available options will be based on the parent object you selected.',
            },
            title: {
              displayName: 'Title',
              shortDesc: 'The title of the note',
              longDesc:
                'Provide a title for the note. This will appear as the heading when viewing the note in Attio.',
            },
            format: {
              displayName: 'Format',
              shortDesc: 'The text format to use for the note content',
              longDesc:
                'Choose whether the note content should be treated as plain text or markdown. Markdown allows for rich text formatting including headers, lists, links, and more.',
            },
            content: {
              displayName: 'Content',
              shortDesc: 'The main body text of the note',
              longDesc:
                'Enter the content for your note. This can be formatted according to the selected format type (plain text or markdown).',
            },
          },
        },
        create_task: {
          displayName: 'Create Task',
          shortDesc: 'Creates a new task in Attio with specified details.',
          longDesc:
            'This action creates a new task in Attio with content, deadline, completion status, and optional assignees. You can set the task content, specify a deadline date, mark it as completed or not, and assign it to one or more workspace members.',
          options: {
            content: {
              displayName: 'Task Content',
              shortDesc: 'The content or description of the task',
              longDesc:
                'Enter the content or description for the task. This will be the main text describing what needs to be done.',
            },
            deadline_at: {
              displayName: 'Deadline',
              shortDesc: 'The deadline date for the task',
              longDesc:
                'Specify the date and time by which the task should be completed. This will be displayed in the task details and can be used for sorting and filtering tasks.',
            },
            is_completed: {
              displayName: 'Completed',
              shortDesc: 'Whether the task is already completed',
              longDesc:
                'Specify whether the task should be marked as completed when created. Default is false (task is not completed).',
            },
            assignees: {
              displayName: 'Assignees',
              shortDesc: 'Workspace members to assign the task to',
              longDesc:
                'Select one or more workspace members who will be assigned to this task. These members will be responsible for completing the task and will receive notifications about it.',
            },
          },
        },
        get_tasks: {
          displayName: 'List Tasks',
          shortDesc: 'Retrieves a list of tasks from Attio with filtering options.',
          longDesc:
            'This action retrieves a list of tasks from Attio with various filtering, sorting, and pagination options. You can filter tasks by linked records, completion status, and assignee, as well as control the order and number of results returned.',
          options: {
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of tasks to return',
              longDesc:
                'Specify the maximum number of tasks to return in a single request. Default is 10.',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of tasks to skip',
              longDesc:
                'Specify the number of tasks to skip before starting to return results. Useful for pagination. Default is 0.',
            },
            linked_object: {
              displayName: 'Linked Object',
              shortDesc: 'Filter tasks by linked object type',
              longDesc:
                'Filter tasks to only include those linked to a specific object type in Attio. When selected, you can further refine by specifying a particular record.',
            },
            linked_record_id: {
              displayName: 'Linked Record ID',
              shortDesc: 'Filter tasks by specific linked record',
              longDesc:
                'Filter tasks to only include those linked to a specific record in the selected linked object. This option is only available after selecting a linked object.',
            },
            is_completed: {
              displayName: 'Completed',
              shortDesc: 'Filter by completion status',
              longDesc:
                'Filter tasks based on whether they are completed or not. Default is false (shows incomplete tasks).',
            },
            sort: {
              displayName: 'Sort Order',
              shortDesc: 'Order of returned tasks',
              longDesc:
                "Specify the order in which tasks should be returned. 'Oldest First' sorts by creation date ascending, 'Newest First' sorts by creation date descending.",
            },
            assignee: {
              displayName: 'Assignee',
              shortDesc: 'Filter tasks by assignee',
              longDesc:
                'Filter tasks to only include those assigned to a specific workspace member.',
            },
          },
        },
        get_notes: {
          displayName: 'Get Notes',
          shortDesc: 'Retrieves Notes from Attio.',
          longDesc: 'Retrieve Notes from your Attio workspace. ',
          options: {
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of notes to return',
              longDesc:
                'The maximum number of notes to return. Default is 50. You can specify a value between 1 and 100.',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of notes to skip',
              longDesc:
                'The number of notes to skip before starting to return results. Used for pagination. Default is 0.',
            },
            parent_object: {
              displayName: 'Parent Object',
              shortDesc: 'The parent object type',
              longDesc:
                'The type of the parent object that this note is linked to. This is required to filter notes by their parent object.',
            },
            parent_record_id: {
              displayName: 'Parent Record ID',
              shortDesc: 'ID of the parent record',
              longDesc:
                'The unique identifier of the parent record to which this note is linked. This is required to filter notes by their parent record.',
            },
          },
        },
        get_task: {
          displayName: 'Get Task',
          shortDesc: 'Retrieves a specific task from Attio by its ID.',
          longDesc:
            'This action retrieves a single task from Attio using its unique task ID. The response includes all task details such as content, completion status, deadline, linked records, assignees, and creation information.',
          options: {
            task_id: {
              displayName: 'Task ID',
              shortDesc: 'The ID of the specific task to retrieve',
              longDesc:
                'Specify the unique identifier of the task you want to retrieve. The available task IDs will be loaded based on your previous object selection.',
            },
          },
        },
        get_object_record: {
          displayName: 'Get Single Object Record',
          shortDesc: 'Retrieves a specific record from an Attio object.',
          longDesc:
            'This action retrieves a single record from an Attio object by its record ID. You must specify both the object and the specific record ID you want to retrieve. This provides detailed information about the record including all its attributes and values.',
          options: {
            object: {
              displayName: 'Object',
              shortDesc: 'The Attio object to retrieve the record from',
              longDesc:
                'Select the Attio object that contains the record you want to retrieve. This is required to identify which object to search in.',
            },
            record_id: {
              displayName: 'Record ID',
              shortDesc: 'The ID of the specific record to retrieve',
              longDesc:
                "Specify the unique identifier of the record you want to retrieve. This ID is specific to the object you've selected and will load available records based on your object selection.",
            },
          },
        },
        get_list_entry: {
          displayName: 'Get Single List Entry',
          shortDesc: 'Retrieves a specific entry from an Attio list.',
          longDesc:
            'This action retrieves a single entry from an Attio list by its entry ID. You must specify both the list and the specific entry ID you want to retrieve. This provides detailed information about the entry including all its attributes and values.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to retrieve the entry from',
              longDesc:
                'Select the Attio list that contains the entry you want to retrieve. This is required to identify which list to search in.',
            },
            entry_id: {
              displayName: 'Entry ID',
              shortDesc: 'The ID of the specific entry to retrieve',
              longDesc:
                "Specify the unique identifier of the entry you want to retrieve. This ID is specific to the list you've selected and will load available entries based on your list selection.",
            },
          },
        },
        find_list_entries: {
          displayName: 'Find List Entries',
          shortDesc: 'Search for entries in an Attio list with filtering and sorting options.',
          longDesc:
            'Queries entries from a specific Attio list with support for filtering by attribute values, sorting by attributes, and pagination. Returns a list of entries matching the specified criteria.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to search',
              longDesc: 'The API slug of the Attio list to search entries in.',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of entries to return',
              longDesc: 'The maximum number of entries to return. Default is 50.',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of entries to skip',
              longDesc:
                'The number of entries to skip before starting to return results. Used for pagination. Default is 0.',
            },
            sort_attribute: {
              displayName: 'Sort Attribute',
              shortDesc: 'Attribute to sort by',
              longDesc: 'The attribute to sort the results by. Default is "created_at".',
            },
            sort_direction: {
              displayName: 'Sort Direction',
              shortDesc: 'Sort direction',
              longDesc:
                'The direction to sort the results. Can be either ascending or descending. Default is ascending.',
            },
            filter: {
              displayName: 'Filter',
              shortDesc: 'Filter criteria',
              longDesc: 'Filter criteria to apply to the query.',
              type: {
                fields: {
                  attribute: {
                    displayName: 'Attribute',
                    shortDesc: 'Attribute to filter by',
                    longDesc: 'The attribute to filter by.',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'Filter value',
                    longDesc: 'The value to filter by.',
                  },
                },
              },
            },
          },
        },
        update_list_entry: {
          displayName: 'Update List Entry',
          shortDesc: 'Update an existing entry in an Attio list.',
          longDesc:
            'Updates the attribute values of an existing entry in a specified Attio list. Requires the list identifier, entry ID, and the attribute values to update.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list containing the entry',
              longDesc: 'The API slug of the Attio list containing the entry to update.',
            },
            entry_id: {
              displayName: 'Entry ID',
              shortDesc: 'ID of the entry to update',
              longDesc: 'The unique identifier of the list entry to update.',
            },
            attributes: {
              displayName: 'Attributes',
              shortDesc: 'Values to update',
              longDesc:
                'A hash of attribute names and their new values to update in the list entry.',
            },
          },
        },
        create_list_entry: {
          displayName: 'Create List Entry',
          shortDesc: 'Create a new entry in an Attio list.',
          longDesc:
            'Creates a new entry in a specified Attio list. Requires the list identifier, parent object reference, and attribute values to populate the entry.',
          options: {
            list: {
              displayName: 'List',
              shortDesc: 'The Attio list to create entry in',
              longDesc: 'The API slug of the Attio list where the new entry will be created.',
            },
            parent_object: {
              displayName: 'Parent Object',
              shortDesc: 'The parent object type',
              longDesc: 'The type of the parent object that this list entry belongs to.',
            },
            parent_record_id: {
              displayName: 'Parent Record ID',
              shortDesc: 'ID of the parent record',
              longDesc:
                'The unique identifier of the parent record to which this list entry will be linked.',
            },
            attributes: {
              displayName: 'Attributes',
              shortDesc: 'Values for list entry attributes',
              longDesc:
                'A hash of attribute names and their values to populate in the new list entry.',
            },
          },
        },
        update_object_record: {
          displayName: 'Update Object Record',
          shortDesc: 'Update an existing record in an Attio object.',
          longDesc:
            'Updates the values of an existing record in a specified Attio object. Requires the object type, record ID, and the attribute values to update.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Attio object to update',
              longDesc: 'The API slug of the Attio object type containing the record to update.',
            },
            record_id: {
              displayName: 'Record ID',
              shortDesc: 'ID of the record to update',
              longDesc: 'The unique identifier of the record to update.',
            },
            attributes: {
              displayName: 'Attributes',
              shortDesc: 'Values to update',
              longDesc: 'A hash of attribute names and their new values to update in the record.',
            },
          },
        },
        find_object_records: {
          displayName: 'Find Object Records',
          shortDesc: 'Search for records in an Attio object with filtering and sorting options.',
          longDesc:
            'Queries records from a specific Attio object with support for filtering by attribute values, sorting by attributes, and pagination. Returns a list of records matching the specified criteria.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Attio object to search',
              longDesc: 'The API slug of the Attio object type to search in.',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of records to return',
              longDesc: 'The maximum number of records to return. Default is 50.',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of records to skip',
              longDesc:
                'The number of records to skip before starting to return results. Used for pagination. Default is 0.',
            },
            sort_attribute: {
              displayName: 'Sort Attribute',
              shortDesc: 'Attribute to sort by',
              longDesc: 'The attribute to sort the results by. Default is "created_at".',
            },
            sort_direction: {
              displayName: 'Sort Direction',
              shortDesc: 'Sort direction',
              longDesc:
                'The direction to sort the results. Can be either ascending or descending. Default is ascending.',
            },
            filter: {
              displayName: 'Filter',
              shortDesc: 'Filter criteria',
              longDesc: 'Filter criteria to apply to the query.',
              type: {
                fields: {
                  attribute: {
                    displayName: 'Attribute',
                    shortDesc: 'Attribute to filter by',
                    longDesc: 'The attribute to filter by.',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'Filter value',
                    longDesc: 'The value to filter by.',
                  },
                },
              },
            },
          },
        },
        create_object_record: {
          displayName: 'Create Object Record',
          shortDesc: 'Create a new record in a specified object',
          longDesc:
            'Create a new record in a specified object within your Attio workspace. This action allows you to define the object type and the attributes for the new record.',
          options: {
            object: {
              displayName: 'Object',
              shortDesc: 'Select the object type',
              longDesc:
                'Choose the object type in which you want to create a new record. This can be a custom object or a standard object in your Attio workspace.',
            },
            attributes: {
              displayName: 'Attributes',
              shortDesc: 'Define the attributes for the new record',
              longDesc:
                'Specify the attributes and their values for the new record. The attributes must match the schema of the selected object type.',
            },
          },
        },
      },
    },
    Intercom: {
      displayName: 'Intercom',
      shortDesc: 'Interact with Intercom customer messaging platform',
      longDesc:
        'Connect with Intercom to manage contacts, companies, conversations, and events. This integration allows you to both perform actions and respond to events in your Intercom workspace, enabling you to automate customer communications and data management workflows.',
      triggers: {
        'new-contact': {
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new contact is created in Intercom',
          longDesc:
            'This trigger fires whenever a new contact is created in your Intercom account. You can filter by role (user, lead, or both).',
          options: {
            role: {
              displayName: 'Contact Role',
              shortDesc: 'Filter contacts by role',
              longDesc:
                'Choose whether to trigger for users, leads, or both types of contacts. Default is "contact" (both).',
            },
          },
        },
        'new-conversation': {
          displayName: 'New Conversation',
          shortDesc: 'Triggers when a new conversation is created in Intercom',
          longDesc:
            'This trigger fires whenever a new conversation is created in your Intercom account. It monitors for conversation creation events and provides all conversation details.',
        },
      },
      actions: {
        searchConversations: {
          options: {
            query: {
              displayName: 'Search Query',
              shortDesc: 'Query to search for conversations',
              longDesc: 'Query to search for conversations',
              type: {
                fields: {
                  field: {
                    displayName: 'Field',
                    shortDesc: 'Field to search in',
                    longDesc: 'Field to search in',
                  },
                  operator: {
                    displayName: 'Operator',
                    shortDesc: 'Operator to use for the search',
                    longDesc: 'Operator to use for the search',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'Value to search for',
                    longDesc: 'Value to search for',
                  },
                },
              },
            },
          },
        },
        SearchContacts: {
          options: {
            query: {
              displayName: 'Search Query',
              shortDesc: 'Query to search for contacts',
              longDesc: 'Query to search for contacts',
              type: {
                fields: {
                  field: {
                    displayName: 'Field',
                    shortDesc: 'Field to search in',
                    longDesc: 'Field to search in',
                  },
                  operator: {
                    displayName: 'Operator',
                    shortDesc: 'Operator to use for the search',
                    longDesc: 'Operator to use for the search',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'Value to search for',
                    longDesc: 'Value to search for',
                  },
                },
              },
            },
          },
        },
        createMessage: {
          options: {
            from: {
              displayName: 'Sender',
              shortDesc: 'Sender of the message',
              longDesc: 'Sender of the message',
            },
            to: {
              displayName: 'Recipient',
              shortDesc: 'Recipient of the message',
              longDesc: 'Recipient of the message',
            },
          },
        },
        createNote: {
          displayName: 'Add Note to Contact',
          options: {
            id: {
              displayName: 'Contact ID',
              shortDesc: 'ID of the contact to add a note to',
              longDesc: 'ID of the contact to add a note to',
            },
            body: {
              displayName: 'Note Body',
              shortDesc: 'Content of the note to add',
              longDesc: 'Content of the note to add',
            },
          },
        },
        createConversation: {
          displayName: 'Create Conversation',
        },
        lisDataEvents: {
          options: {
            filter: {
              displayName: 'Filter',
              shortDesc: 'Filter field for the data event',
              longDesc: 'Filter field for the data event',
            },
            value: {
              displayName: 'Value',
              shortDesc: 'Value for the filter field',
              longDesc: 'Value for the filter field',
            },
          },
        },
      },
    },
    Xero: {
      displayName: 'Xero',
      shortDesc: `Seamlessly interact with Xero's API`,
      longDesc: 'Connect, manage, and automate tasks via the Xero API',
      triggers: {
        new_bank_transaction: {
          displayName: 'New Bank Transaction',
          shortDesc: 'Triggers when a new bank transaction is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for new bank transactions. You can filter by bank account and transaction type (money in or money out).',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new bank transactions',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new bank transactions',
            },
            transactionType: {
              displayName: 'Transaction Type',
              shortDesc: 'Filter transactions by type (money in or money out)',
              longDesc:
                'Optionally filter to only trigger on specific transaction types: "Receive" for money coming into your account, or "Spend" for money going out',
            },
            bankAccountId: {
              displayName: 'Bank Account',
              shortDesc: 'Filter transactions by bank account',
              longDesc:
                'Optionally filter to only trigger on transactions from a specific bank account',
            },
          },
        },
        new_contact: {
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new contact is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for newly created contacts. You can filter to only monitor customers, suppliers, or all contacts.',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new contacts',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new contacts',
            },
            contactType: {
              displayName: 'Contact Type',
              shortDesc: 'Filter by customer or supplier type',
              longDesc: 'Choose whether to monitor all contacts, only customers, or only suppliers',
            },
          },
        },
        new_credit_note: {
          displayName: 'New Credit Note',
          shortDesc: 'Triggers when a new credit note is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for newly created credit notes. You can filter by customer and status.',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new credit notes',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new credit notes',
            },
            contactId: {
              displayName: 'Customer',
              shortDesc: 'Filter credit notes by a specific customer',
              longDesc:
                'Optionally filter to only trigger on credit notes for a specific customer (contact)',
            },
            status: {
              displayName: 'Credit Note Status',
              shortDesc: 'Filter credit notes by their status',
              longDesc:
                'Optionally filter to only trigger on credit notes with a specific status (Draft, Submitted, Authorised, etc.)',
            },
          },
        },
        new_employee: {
          displayName: 'New Employee',
          shortDesc: 'Triggers when a new employee is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for newly created employees. You can filter by employee status (active or terminated).',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new employees',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new employees',
            },
            status: {
              displayName: 'Employee Status',
              shortDesc: 'Filter employees by active or terminated status',
              longDesc:
                'Choose whether to monitor all employees, only active employees, or only terminated employees',
            },
          },
        },
        new_payment: {
          displayName: 'New Payment',
          shortDesc: 'Triggers when a new payment is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for new payments. You can filter by customer, payment status, and bank account.',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new payments',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new payments',
            },
            contactId: {
              displayName: 'Customer',
              shortDesc: 'Filter payments by a specific customer',
              longDesc:
                'Optionally filter to only trigger on payments from a specific customer (contact)',
            },
            status: {
              displayName: 'Payment Status',
              shortDesc: 'Filter payments by their status',
              longDesc:
                'Optionally filter to only trigger on payments with a specific status (Authorised or Deleted)',
            },
            bankAccountId: {
              displayName: 'Bank Account',
              shortDesc: 'Filter payments by bank account',
              longDesc:
                'Optionally filter to only trigger on payments to or from a specific bank account',
            },
          },
        },
        new_purchase_order: {
          displayName: 'New Purchase Order',
          shortDesc: 'Triggers when a new purchase order is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for newly created purchase orders. You can filter by supplier and purchase order status.',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new purchase orders',
              longDesc:
                'Select which Xero organization (tenant) should be monitored for new purchase orders',
            },
            contactId: {
              displayName: 'Supplier',
              shortDesc: 'Filter purchase orders by a specific supplier',
              longDesc:
                'Optionally filter to only trigger on purchase orders from a specific supplier (contact)',
            },
            status: {
              displayName: 'Purchase Order Status',
              shortDesc: 'Filter purchase orders by their status',
              longDesc:
                'Optionally filter to only trigger on purchase orders with a specific status (Draft, Submitted, Authorised, etc.)',
            },
          },
        },
        new_bill: {
          displayName: 'New Bill',
          shortDesc: 'Triggers when a new bill is created in Xero',
          longDesc:
            'This trigger monitors your Xero account for newly created bills (Accounts Payable invoices). You can filter by supplier (contact), status, or monitor all new bills.',
          options: {
            'xero-tenant-id': {
              displayName: 'Xero Organization',
              shortDesc: 'The Xero organization to monitor for new bills',
              longDesc: 'Select which Xero organization (tenant) should be monitored for new bills',
            },
            contactId: {
              displayName: 'Supplier',
              shortDesc: 'Filter bills by a specific supplier',
              longDesc:
                'Optionally filter to only trigger on bills from a specific supplier (contact)',
            },
            status: {
              displayName: 'Bill Status',
              shortDesc: 'Filter bills by their status',
              longDesc:
                'Optionally filter to only trigger on bills with a specific status (Draft, Submitted, Authorised, etc.)',
            },
          },
        },
      },
      actions: {
        getProjects: {
          displayName: 'Find Projects',
        },
        createProject: {
          displayName: 'Create Project',
        },
        getTasks: {
          displayName: 'Find Tasks',
        },
        createTask: {
          displayName: 'Create Task',
        },
        getProjectUsers: {
          displayName: 'Find Project Users',
        },
        uploadFile: {
          displayName: 'Upload Attachment',
          options: {
            body: {
              displayName: 'File',
              shortDesc: 'File to upload',
              longDesc: 'File to upload',
            },
          },
        },
        updateOrCreateBankTransactions: {
          displayName: 'Create Bank Transaction',
        },
        getContacts: {
          displayName: 'Find Contacts',
        },
        updateOrCreateContacts: {
          displayName: 'Create or Update Contacts',
        },
        updateOrCreateCreditNotes: {
          displayName: 'Create Credit Note',
        },
        createCreditNoteAllocation: {
          displayName: 'Allocate Credit Note to Invoice',
          options: {
            InvoiceID: {
              displayName: 'Invoice ID',
              shortDesc: 'ID of the invoice to allocate the credit note to',
              longDesc: 'ID of the invoice to allocate the credit note to',
            },
            Amount: {
              displayName: 'Amount',
              shortDesc: 'Amount to allocate from the credit note',
              longDesc: 'Amount to allocate from the credit note',
            },
          },
        },
        getEmployees: {
          displayName: 'Find Employees',
        },
        updateOrCreateEmployees: {
          displayName: 'Create/Update Employee',
        },
        getInvoices: {
          displayName: 'Find Invoices',
        },
        updateOrCreateInvoices: {
          displayName: 'Create Sales Invoice',
        },
        updateInvoice: {
          displayName: 'Update Sales Invoice',
        },
        emailInvoice: {
          displayName: 'Send Sales Invoice by Email',
        },
        getInvoiceHistory: {
          displayName: 'Get Invoice History',
        },
        createInvoiceHistory: {
          displayName: 'Add Note to Invoice',
          options: {
            note: {
              displayName: 'Note',
              shortDesc: 'Note to add to the invoice history',
              longDesc: 'Note to add to the invoice history',
            },
          },
        },
        getItems: {
          displayName: 'Find Items',
        },
        updateOrCreateItems: {
          displayName: 'Add or Update Stock Items',
        },
        createPayment: {
          displayName: 'Create Payment',
        },
        getPurchaseOrders: {
          displayName: 'Find Purchase Orders',
        },
        updateOrCreatePurchaseOrders: {
          displayName: 'Create Purchase Order',
        },
        updatePurchaseOrder: {
          displayName: 'Update Purchase Order',
        },
        updateOrCreateQuotes: {
          displayName: 'Create New Quote Draft',
        },
        updateOrCreateRepeatingInvoices: {
          displayName: 'Create Repeating Sales Invoice',
        },
      },
    },
    Dynamics: {
      triggers: {
        'new-or-updated-account': {
          displayName: 'New or Updated Account',
          shortDesc: 'Triggers when an account is created or modified',
          longDesc:
            'Monitors Dynamics 365 for accounts, allowing you to choose whether to trigger on newly created accounts or when existing accounts are modified.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Select whether to trigger when accounts are created or when they are updated. Only one condition can be selected at a time.',
            },
          },
        },
        'new-or-updated-case': {
          displayName: 'New or Updated Case',
          shortDesc: 'Triggers when a case is created or modified',
          longDesc:
            'Detects when support cases are created or updated in Dynamics 365, enabling automated responses, notifications, or case management workflows.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Specify whether to trigger on new cases (created) or when existing cases are modified (updated). You must select one option.',
            },
          },
        },
        'new-or-updated-contact': {
          displayName: 'New or Updated Contact',
          shortDesc: 'Triggers when a contact is created or modified',
          longDesc:
            'Monitors your Dynamics 365 environment for contacts, allowing you to trigger workflows either when new contacts are added or when existing contact records are changed.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Select whether the trigger should fire for newly created contacts or for updates to existing contacts. Only one option can be active.',
            },
          },
        },
        'new-custom-entity': {
          displayName: 'New Custom Entity Record',
          shortDesc: 'Triggers when a custom entity record is created',
          longDesc:
            "Works with your organization's custom entities in Dynamics 365, allowing you to monitor and respond when new records are created for any custom entity type you specify.",
          options: {
            entityName: {
              displayName: 'Entity Logical Name',
              shortDesc: 'The internal name of the custom entity',
              longDesc:
                'Enter the logical (schema) name of the custom entity you want to monitor. This is typically in the format "new_entityname" or "custom_entityname".',
            },
          },
        },
        'new-or-updated-invoice': {
          displayName: 'New or Updated Invoice',
          shortDesc: 'Triggers when an invoice is created or modified',
          longDesc:
            'Monitors invoice-related activities in Dynamics 365, letting you choose to trigger workflows either when new invoices are created or when existing ones are updated.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Specify whether to trigger on newly created invoices or when existing invoices are modified. You must select one option.',
            },
          },
        },
        'new-or-updated-lead': {
          displayName: 'New or Updated Lead',
          shortDesc: 'Triggers when a lead is created or modified',
          longDesc:
            'Detects when leads are added or modified in Dynamics 365, allowing you to choose whether to trigger on new leads or when existing lead records change.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Select whether to trigger when new leads are created or when existing leads are updated. Only one condition can be selected.',
            },
          },
        },
        'new-or-updated-opportunity': {
          displayName: 'New or Updated Opportunity',
          shortDesc: 'Triggers when an opportunity is created or modified',
          longDesc:
            'Monitors your sales pipeline in Dynamics 365, giving you the option to trigger workflows either when new opportunities are created or when existing ones change.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Specify whether to trigger on new opportunities being created or on updates to existing opportunities. You must select one option.',
            },
          },
        },
        'new-or-updated-order': {
          displayName: 'New or Updated Order',
          shortDesc: 'Triggers when an order is created or modified',
          longDesc:
            'Tracks order-related activities in Dynamics 365, allowing you to choose whether to trigger workflows when new orders are placed or when existing orders are updated.',
          options: {
            condition: {
              displayName: 'Trigger Condition',
              shortDesc: 'Choose created or updated',
              longDesc:
                'Select whether to trigger on newly created orders or when existing orders are modified. Only one condition can be active at a time.',
            },
          },
        },
      },
    },
    Mailchimp: {
      displayName: 'Mailchimp',
      shortDesc: 'Email marketing, automation, and analytics platform',
      longDesc:
        'Connect with Mailchimp to create and manage email campaigns, track subscriber activities, and automate marketing workflows.',
      triggers: {
        email_opened: {
          displayName: 'Email Opened',
          shortDesc: 'Triggers when a subscriber opens an email',
          longDesc:
            'This trigger fires whenever a subscriber opens an email from your campaigns or automation workflows.',
          options: {
            audience: {
              displayName: 'Audience',
              shortDesc: 'Select the audience to monitor',
              longDesc: 'Choose which Mailchimp audience (mailing list) to track for email opens.',
            },
            campaign_type: {
              displayName: 'Campaign Type',
              shortDesc: 'Type of campaign to monitor',
              longDesc: 'Specify whether to track regular campaigns, automations.',
            },
            trigger_on_subscriber: {
              displayName: 'Trigger on Subscriber',
              shortDesc: 'Trigger for specific subscribers only',
              longDesc:
                'Optionally specify one or more email addresses to only trigger for these specific subscribers.',
            },
            campaign: {
              displayName: 'Campaign',
              shortDesc: 'Select a specific campaign',
              longDesc:
                'Choose a specific campaign to monitor for opens. Leave blank to monitor all campaigns.',
            },
            workflow_id: {
              displayName: 'Workflow ID',
              shortDesc: 'Automation workflow ID',
              longDesc: 'If monitoring an automation, specify the workflow ID to track.',
            },
            automation_email: {
              displayName: 'Automation Email',
              shortDesc: 'Specific automation email',
              longDesc: 'Select a specific email within an automation workflow to monitor.',
            },
          },
        },
        new_unsubscriber: {
          displayName: 'New Unsubscriber',
          shortDesc: 'Triggers when someone unsubscribes',
          longDesc:
            'This trigger fires whenever a contact unsubscribes from your Mailchimp audience.',
          options: {
            audience: {
              displayName: 'Audience',
              shortDesc: 'Select the audience to monitor',
              longDesc: 'Choose which Mailchimp audience to track for unsubscribes.',
            },
          },
        },
        new_subscriber: {
          displayName: 'New Subscriber',
          shortDesc: 'Triggers when a new subscriber joins',
          longDesc:
            'This trigger fires whenever a new contact subscribes to your Mailchimp audience.',
          options: {
            audience: {
              displayName: 'Audience',
              shortDesc: 'Select the audience to monitor',
              longDesc: 'Choose which Mailchimp audience to track for new subscribers.',
            },
          },
        },
      },
    },
    Notion: {
      displayName: 'Notion',
      shortDesc: 'Collection of actions to interact with the Notion API',
      longDesc: 'Collection of actions to interact with the Notion API',
      triggers: {
        new_database_item: {
          displayName: 'New Database Item',
          shortDesc: 'Triggers when a new item is added to a database',
          longDesc: 'Triggers when a new item is added to a database',
          options: {
            databaseId: {
              displayName: 'Database ID',
              shortDesc: 'The ID of the database to watch for new items',
              longDesc: 'The ID of the database to watch for new items',
            },
          },
          event_info: {
            desc: 'Notion New Database Item Event Info',
          },
        },
        updated_database_item: {
          displayName: 'Updated Database Item',
          shortDesc: 'Triggers when an item in a database is updated',
          longDesc: 'Triggers when an item in a database is updated',
          options: {
            databaseId: {
              displayName: 'Database ID',
              shortDesc: 'The ID of the database to watch for updates',
              longDesc: 'The ID of the database to watch for updates',
            },
          },
          event_info: {
            desc: 'Notion Updated Database Item Event Info',
          },
        },
        updated_page: {
          displayName: 'Updated Page',
          shortDesc: 'Triggers when a page is updated',
          longDesc: 'Triggers when a page is updated',
          options: {
            pageId: {
              displayName: 'Page ID',
              shortDesc: 'The ID of the page to watch for updates',
              longDesc: 'The ID of the page to watch for updates',
            },
          },
          event_info: {
            desc: 'Notion Page Updated Event Info',
          },
        },
      },
    },
    Jira: {
      displayName: 'Jira',
      shortDesc: 'Collection of actions to interact with the Jira API',
      longDesc: 'Collection of actions to interact with the Jira API',
      triggers: {
        issue_created: {
          displayName: 'New Issue',
          shortDesc: 'Triggers when a new issue is created',
          longDesc: 'Triggers when a new issue is created',
          options: {
            project: {
              displayName: 'Project',
              shortDesc: 'The project to watch for new issues',
              longDesc: 'The project to watch for new issues',
            },
          },
        },
        issue_updated: {
          displayName: 'Updated Issue',
          shortDesc: 'Triggers when an issue is updated',
          longDesc: 'Triggers when an issue is updated',
          options: {
            project: {
              displayName: 'Project',
              shortDesc: 'The project to watch for updated issues',
              longDesc: 'The project to watch for updated issues',
            },
          },
        },
        project_created: {
          displayName: 'New Project',
          shortDesc: 'Triggers when a new project is created',
          longDesc: 'Triggers when a new project is created',
        },
      },
    },
    Stripe: {
      displayName: 'Stripe',
      shortDesc: 'Collection of actions to interact with the Stripe API',
      longDesc: 'Collection of actions to interact with the Stripe API',
      triggers: {
        charge_dispute_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'New Charge Dispute',
          shortDesc: 'Triggers when a dispute is created for a previously made charge.',
          longDesc:
            'This trigger fires whenever a customer initiates a dispute (also known as a chargeback) against a completed charge. You can use this to respond promptly, provide evidence, or communicate with the customer regarding the disputed charge.',
          event_info: {
            desc: 'Provides details about the newly created dispute, including the reason, amount, and any relevant metadata.',
          },
        },
        charge_refunded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Charge Refunded',
          shortDesc: 'Triggers when an existing charge is fully or partially refunded.',
          longDesc:
            'This trigger fires whenever you issue a refund to a customer for a previously successful charge. It includes information about the refunded amount, the original charge details, and the refund reason.',
          event_info: {
            desc: 'Contains refund details, including the refunded amount, the source charge, and the timestamp of the refund.',
          },
        },
        charge_succeeded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Charge Succeeded',
          shortDesc: 'Triggers when a new charge is successfully completed.',
          longDesc:
            'This trigger fires whenever a payment charge is successfully processed, typically following a card payment or another supported payment method. Use this event to fulfill orders, send confirmations, or update your internal records.',
          event_info: {
            desc: 'Includes details about the successful charge, such as the amount, payment method, and associated customer or order data.',
          },
        },
        checkout_session_completed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Checkout Session Completed',
          shortDesc:
            'Triggers when a Stripe Checkout session is finalized and the payment is successful.',
          longDesc:
            "This trigger fires after a customer completes the entire Stripe Checkout flow, including any required payment steps. It's ideal for finalizing orders, sending receipts, and granting access to purchased products or services.",
          event_info: {
            desc: 'Provides information about the completed checkout session, including the purchased items, total amount, and customer details.',
          },
        },
        customer_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Customer Created',
          shortDesc: 'Triggers when a new customer record is added to your Stripe account.',
          longDesc:
            'This trigger fires whenever a new customer is created, either through your website, the Stripe dashboard, or via the API. You can use this event to start onboarding processes, welcome emails, or custom CRM integrations.',
          event_info: {
            desc: 'Contains details of the newly created customer, such as their email address, billing information, and associated metadata.',
          },
        },
        invoice_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Invoice Created',
          shortDesc: 'Triggers when a new invoice is generated.',
          longDesc:
            "This trigger fires whenever an invoice is created, either automatically as part of a recurring billing cycle or manually. It's useful for sending invoice notifications, updating financial systems, or automating payment reminders.",
          event_info: {
            desc: 'Provides the full invoice object, including line items, amounts due, currency, and related customer information.',
          },
        },
        invoice_payment_failed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Invoice Payment Failed',
          shortDesc: 'Triggers when an attempt to pay an invoice fails.',
          longDesc:
            'This trigger fires whenever Stripe attempts to charge a customer for an invoice and the payment is declined or otherwise fails. Use it to send payment failure notices, prompt customers to update their payment methods, or pause services until payment is resolved.',
          event_info: {
            desc: 'Includes details about the failed payment attempt, such as the invoice amount, payment method, and the reason for failure.',
          },
        },

        payment_intent_failed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Intent Failed',
          shortDesc: 'Triggers when a Payment Intent cannot be completed successfully.',
          longDesc:
            'This event fires when a Payment Intent—created to handle dynamic payment flows—ultimately fails, for example, due to insufficient funds, authentication failures, or timeouts. Use this to notify customers of payment issues or prompt them to try another payment method.',
          event_info: {
            desc: 'Includes details about the failed Payment Intent, such as the amount, currency, payment method attempts, and the reason for failure.',
          },
        },
        payment_intent_succeeded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Intent Succeeded',
          shortDesc: 'Triggers when a Payment Intent successfully completes, confirming payment.',
          longDesc:
            'This trigger fires when a Payment Intent transitions to a successful state, indicating that funds are captured or confirmed. Use it to fulfill orders, update your internal systems, or send customers confirmation messages.',
          event_info: {
            desc: 'Provides comprehensive details about the successful Payment Intent, including payment amount, method, customer details, and associated metadata.',
          },
        },
        payment_link_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Link Created',
          shortDesc: 'Triggers when a new Payment Link is created.',
          longDesc:
            'This trigger fires whenever you create a Payment Link, which provides a hosted payment page that customers can use to pay for a product or service. You can use this event to track link creation, automate sharing, or log link details in your CRM.',
          event_info: {
            desc: 'Contains information about the new Payment Link, including URL, product details, and associated pricing configurations.',
          },
        },
        subscription_canceled: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Canceled',
          shortDesc: 'Triggers when an active subscription is canceled.',
          longDesc:
            'This event fires whenever a subscription is canceled, whether by the customer, via API, or due to an automatic cancellation (e.g., payment failures). Use it to adjust service access, send account closure notices, or offer re-subscription incentives.',
          event_info: {
            desc: 'Provides details about the canceled subscription, such as the cancellation reason, effective end date, and any prorated refunds.',
          },
        },
        subscription_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Created',
          shortDesc: 'Triggers when a new subscription is successfully created.',
          longDesc:
            'This event fires whenever a customer starts a new subscription, either by signing up for a plan or adding a subscription product. Use it to onboard new subscribers, grant access to services, or send a welcome message.',
          event_info: {
            desc: 'Includes details about the newly created subscription, including plan information, start date, and billing cycle details.',
          },
        },
        subscription_updated: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Updated',
          shortDesc: 'Triggers when a subscription’s details change.',
          longDesc:
            'This event fires whenever a subscription’s parameters are updated. For example, a change in the billing cycle, swapping a plan, adding or removing products, or modifying payment settings. Use it to keep your internal records accurate, send notifications about plan changes, or adjust service access levels.',
          event_info: {
            desc: 'Provides the updated subscription object, highlighting changes such as plan modifications, trial adjustments, or updated billing details.',
          },
        },
      },
      actions: {
        GetAccount: {
          displayName: 'Get account details',
          shortDesc: 'Retrieves the details of the account.',
        },
        PostAccountLinks: {
          displayName: 'Create account links',
          shortDesc:
            'Creates a url that the platform can redirect their user to take them through the Connect Onboarding flow.',
        },
        DeleteAccountsAccount: {
          displayName: 'Delete account',
          shortDesc: 'Deletes the specified account.',
        },
        GetAccountsAccount: {
          displayName: 'Retrieve account',
          shortDesc: 'Retrieves the details of an account.',
        },
        PostAccountsAccount: {
          displayName: 'Update account',
          shortDesc:
            'Updates the specified account by setting the values of the parameters passed.',
        },
        GetAccountsAccountExternalAccounts: {
          displayName: 'List external accounts',
          shortDesc: 'Returns a list of external accounts associated with the Stripe account.',
        },
        PostAccountsAccountExternalAccounts: {
          displayName: 'Create external account',
          shortDesc: 'Create an external account for a connected account.',
        },
        PostAccountsAccountLoginLinks: {
          displayName: 'Create login links',
          shortDesc:
            'Creates a short-lived link that can be used to log in to the Stripe Dashboard.',
        },
        GetAccountsAccountPeople: {
          displayName: 'List people',
          shortDesc: 'Returns a list of people associated with the account.',
        },
        PostAccountsAccountPeople: {
          displayName: 'Create person',
          shortDesc: 'Creates a new person.',
        },
        GetBalance: {
          displayName: 'Retrieve balance',
          shortDesc: 'Retrieves the current account balance.',
        },
        GetBalanceHistory: {
          displayName: 'List balance history',
          shortDesc:
            'Returns a list of transactions that have contributed to the Stripe account balance.',
        },
        GetBalanceHistoryId: {
          displayName: 'Retrieve balance history',
          shortDesc: 'Retrieves the details of a balance history item.',
        },
        GetCharges: {
          displayName: 'List charges',
          shortDesc: 'Returns a list of charges you have previously created.',
        },
        PostCharges: {
          displayName: 'Create charge',
          shortDesc: 'Creates a new charge object.',
        },
        GetChargesCharge: {
          displayName: 'Retrieve charge',
          shortDesc: 'Retrieves the details of a charge.',
        },
        PostChargesCharge: {
          displayName: 'Update charge',
          shortDesc: 'Updates the specified charge by setting the values of the parameters passed.',
        },
        GetCustomers: {
          displayName: 'List customers',
          shortDesc: 'Returns a list of your customers.',
        },
        PostCustomers: {
          displayName: 'Create customer',
          shortDesc: 'Creates a new customer object.',
        },
        DeleteCustomersCustomer: {
          displayName: 'Delete customer',
          shortDesc: 'Deletes the specified customer.',
        },
        GetCustomersCustomer: {
          displayName: 'Retrieve customer',
          shortDesc: 'Retrieves the details of an existing customer.',
        },
        PostCustomersCustomer: {
          displayName: 'Update customer',
          shortDesc:
            'Updates the specified customer by setting the values of the parameters passed.',
        },
        GetCustomersCustomerBalanceTransactions: {
          displayName: 'List balance transactions',
          shortDesc:
            'Returns a list of transactions that have contributed to the customers account balance.',
        },
        PostCustomersCustomerBalanceTransactions: {
          displayName: 'Create balance transaction',
          shortDesc: 'Creates a new balance transaction.',
        },
        GetCustomersCustomerSources: {
          displayName: 'List sources',
          shortDesc: 'Returns a list of sources for the customer.',
        },
        PostCustomersCustomerSources: {
          displayName: 'Create source',
          shortDesc: 'Creates a new source object.',
        },
        GetCustomersCustomerSubscriptions: {
          displayName: 'List subscriptions',
          shortDesc: 'Returns a list of subscriptions for a customer.',
        },
        PostCustomersCustomerSubscriptions: {
          displayName: 'Create subscription',
          shortDesc: 'Creates a new subscription on an existing customer.',
        },
        GetInvoices: {
          displayName: 'List invoices',
          shortDesc: 'Returns a list of your invoices.',
        },
        PostInvoices: {
          displayName: 'Create invoice',
          shortDesc: 'Creates a draft invoice for a given customer.',
        },
        DeleteInvoicesInvoice: {
          displayName: 'Delete invoice',
          shortDesc: 'Deletes the specified invoice.',
        },
        GetInvoicesInvoice: {
          displayName: 'Retrieve invoice',
          shortDesc: 'Retrieves the details of an existing invoice.',
        },
        PostInvoicesInvoice: {
          displayName: 'Update invoice',
          shortDesc:
            'Updates the specified invoice by setting the values of the parameters passed.',
        },
        GetPaymentIntents: {
          displayName: 'List payment intents',
          shortDesc: 'Returns a list of payment intents.',
        },
        PostPaymentIntents: {
          displayName: 'Create payment intent',
          shortDesc: 'Creates a new payment intent.',
        },
        GetRefunds: {
          displayName: 'List refunds',
          shortDesc: 'Returns a list of all refunds you’ve previously created.',
        },
        PostRefunds: {
          displayName: 'Create refund',
          shortDesc: 'Creates a new refund object.',
        },
      },
    },
    Github: {
      displayName: 'Github',
      shortDesc: 'Collection of actions to interact with the Github API',
      longDesc: 'Collection of actions to interact with the Github API',
      triggers: {
        new_repository_issue: {
          displayName: 'New Repository Issue',
          shortDesc: 'Triggers when a new issue is created in a repository',
          longDesc: 'Triggers when a new issue is created in a repository',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
          event_info: {
            desc: 'GitHub Issue Event Data',
            type: {
              fields: {
                action: {
                  displayName: 'Action',
                  shortDesc: 'Action type',
                  longDesc: 'Type of action performed on the issue (e.g., opened, closed)',
                },
                issue: {
                  displayName: 'Issue',
                  shortDesc: 'Issue details',
                  longDesc: 'Details of the issue created',
                  type: {
                    fields: {
                      url: {
                        displayName: 'Issue URL',
                        shortDesc: 'URL of the issue',
                        longDesc: 'The API URL for the specific issue',
                      },
                      number: {
                        displayName: 'Issue Number',
                        shortDesc: 'Number of the issue',
                        longDesc: 'Unique number identifier for the issue',
                      },
                      title: {
                        displayName: 'Issue Title',
                        shortDesc: 'Title of the issue',
                        longDesc: 'The title or subject of the issue',
                      },
                      user: {
                        displayName: 'User',
                        shortDesc: 'Issue creator',
                        longDesc: 'Details of the user who created the issue',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the user',
                            },
                            id: {
                              displayName: 'User ID',
                              shortDesc: 'GitHub user ID',
                              longDesc: 'Unique identifier for the GitHub user',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'User avatar URL',
                              longDesc: "URL of the user's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'User profile URL',
                              longDesc: 'Link to the GitHub profile of the user',
                            },
                          },
                        },
                      },
                      labels: {
                        displayName: 'Labels',
                        shortDesc: 'Issue labels',
                        longDesc: 'List of labels associated with the issue',
                      },
                      state: {
                        displayName: 'State',
                        shortDesc: 'Issue state',
                        longDesc: 'Current state of the issue (e.g., open, closed)',
                      },
                      locked: {
                        displayName: 'Locked',
                        shortDesc: 'Issue lock status',
                        longDesc: 'Whether the issue is locked for editing',
                      },
                      assignee: {
                        displayName: 'Assignee',
                        shortDesc: 'Assigned user',
                        longDesc: 'Details of the user assigned to the issue',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the assignee',
                            },
                            id: {
                              displayName: 'User ID',
                              shortDesc: 'GitHub user ID',
                              longDesc: 'Unique identifier for the GitHub user',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'User avatar URL',
                              longDesc: "URL of the user's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'User profile URL',
                              longDesc: 'Link to the GitHub profile of the assignee',
                            },
                          },
                        },
                      },
                      milestone: {
                        displayName: 'Milestone',
                        shortDesc: 'Milestone details',
                        longDesc: 'Details of the milestone associated with the issue',
                        type: {
                          fields: {
                            url: {
                              displayName: 'Milestone URL',
                              shortDesc: 'Milestone API URL',
                              longDesc: 'The API URL for the milestone',
                            },
                            html_url: {
                              displayName: 'Milestone HTML URL',
                              shortDesc: 'Milestone webpage URL',
                              longDesc: "URL of the milestone's webpage",
                            },
                            labels_url: {
                              displayName: 'Labels URL',
                              shortDesc: 'Labels API URL',
                              longDesc: "API URL for milestone's labels",
                            },
                            id: {
                              displayName: 'Milestone ID',
                              shortDesc: 'Milestone identifier',
                              longDesc: 'Unique identifier for the milestone',
                            },
                            number: {
                              displayName: 'Milestone Number',
                              shortDesc: 'Milestone number',
                              longDesc: 'Unique number for the milestone',
                            },
                            title: {
                              displayName: 'Milestone Title',
                              shortDesc: 'Title of the milestone',
                              longDesc: 'The title of the associated milestone',
                            },
                            description: {
                              displayName: 'Milestone Description',
                              shortDesc: 'Milestone details',
                              longDesc: 'A description of the milestone',
                            },
                            creator: {
                              displayName: 'Creator',
                              shortDesc: 'Milestone creator',
                              longDesc: 'Details of the user who created the milestone',
                              type: {
                                fields: {
                                  login: {
                                    displayName: 'Login',
                                    shortDesc: 'Username',
                                    longDesc: 'GitHub username of the creator',
                                  },
                                  id: {
                                    displayName: 'User ID',
                                    shortDesc: 'GitHub user ID',
                                    longDesc: 'Unique identifier for the creator',
                                  },
                                  avatar_url: {
                                    displayName: 'Avatar URL',
                                    shortDesc: 'User avatar URL',
                                    longDesc: "URL of the creator's avatar image",
                                  },
                                  html_url: {
                                    displayName: 'Profile URL',
                                    shortDesc: 'User profile URL',
                                    longDesc: "Link to the creator's GitHub profile",
                                  },
                                },
                              },
                            },
                            open_issues: {
                              displayName: 'Open Issues',
                              shortDesc: 'Count of open issues',
                              longDesc: 'The number of open issues in this milestone',
                            },
                            closed_issues: {
                              displayName: 'Closed Issues',
                              shortDesc: 'Count of closed issues',
                              longDesc: 'The number of closed issues in this milestone',
                            },
                            state: {
                              displayName: 'State',
                              shortDesc: 'Milestone state',
                              longDesc: 'Current state of the milestone (e.g., open, closed)',
                            },
                            created_at: {
                              displayName: 'Created At',
                              shortDesc: 'Creation time',
                              longDesc: 'Timestamp when the milestone was created',
                            },
                            updated_at: {
                              displayName: 'Updated At',
                              shortDesc: 'Update time',
                              longDesc: 'Timestamp when the milestone was last updated',
                            },
                            due_on: {
                              displayName: 'Due Date',
                              shortDesc: 'Milestone due date',
                              longDesc: 'Date by which the milestone is expected to be completed',
                            },
                            closed_at: {
                              displayName: 'Closed At',
                              shortDesc: 'Closure time',
                              longDesc: 'Timestamp when the milestone was closed',
                            },
                          },
                        },
                      },
                      comments: {
                        displayName: 'Comments Count',
                        shortDesc: 'Number of comments',
                        longDesc: 'Total number of comments on the issue',
                      },
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'Issue creation time',
                        longDesc: 'The timestamp when the issue was created',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'Issue update time',
                        longDesc: 'The timestamp when the issue was last updated',
                      },
                      closed_at: {
                        displayName: 'Closed At',
                        shortDesc: 'Issue closure time',
                        longDesc: 'The timestamp when the issue was closed (if applicable)',
                      },
                      body: {
                        displayName: 'Body',
                        shortDesc: 'Issue description',
                        longDesc: 'The detailed description of the issue',
                      },
                    },
                  },
                },
                repository: {
                  displayName: 'Repository',
                  shortDesc: 'Repository details',
                  longDesc: 'Details of the repository where the issue resides',
                  type: {
                    fields: {
                      id: {
                        displayName: 'Repository ID',
                        shortDesc: 'Unique ID',
                        longDesc: 'Unique identifier for the repository',
                      },
                      name: {
                        displayName: 'Repository Name',
                        shortDesc: 'Name of the repository',
                        longDesc: 'The name of the GitHub repository',
                      },
                      private: {
                        displayName: 'Private',
                        shortDesc: 'Privacy status',
                        longDesc: 'Whether the repository is private',
                      },
                      owner: {
                        displayName: 'Owner',
                        shortDesc: 'Repository owner',
                        longDesc: 'Details of the user or organization that owns the repository',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the owner',
                            },
                            id: {
                              displayName: 'Owner ID',
                              shortDesc: 'Unique ID',
                              longDesc: 'Unique identifier for the repository owner',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'Avatar link',
                              longDesc: "URL of the owner's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'Profile link',
                              longDesc: "Link to the owner's GitHub profile",
                            },
                          },
                        },
                      },
                    },
                  },
                },
                sender: {
                  displayName: 'Sender',
                  shortDesc: 'Event sender',
                  longDesc: 'Details of the sender who triggered the event',
                  type: {
                    fields: {
                      login: {
                        displayName: 'Login',
                        shortDesc: 'Username',
                        longDesc: 'GitHub username of the sender',
                      },
                      id: {
                        displayName: 'Sender ID',
                        shortDesc: 'Unique ID',
                        longDesc: 'Unique identifier for the sender',
                      },
                      html_url: {
                        displayName: 'Profile URL',
                        shortDesc: 'Profile link',
                        longDesc: "Link to the sender's GitHub profile",
                      },
                      avatar_url: {
                        displayName: 'Avatar URL',
                        shortDesc: 'Avatar link',
                        longDesc: "URL of the sender's avatar image",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        new_repository_branch: {
          displayName: 'New Repository Branch',
          shortDesc: 'Triggers when a new branch is created in a repository',
          longDesc: 'Triggers when a new branch is created in a repository',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
        new_commit_comment: {
          displayName: 'New Commit Comment',
          shortDesc: 'Triggers when a new comment is added to a commit',
          longDesc: 'Triggers when a new comment is added to a commit',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
        new_commit: {
          displayName: 'New Commit',
          shortDesc: 'Triggers when a new commit is pushed to a repository',
          longDesc: 'Triggers when a new commit is pushed to a repository',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
        new_pull_request: {
          displayName: 'New Pull Request',
          shortDesc: 'Triggers when a new pull request is opened',
          longDesc: 'Triggers when a new pull request is opened',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
        new_release: {
          displayName: 'New Release',
          shortDesc: 'Triggers when a new release is published',
          longDesc: 'Triggers when a new release is published',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
        new_review_request: {
          displayName: 'New Review Request',
          shortDesc: 'Triggers when a new review is requested',
          longDesc: 'Triggers when a new review is requested',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
        },
      },
    },
    Asana: {
      displayName: 'Asana',
      shortDesc: 'Automate workflows by integrating with the Asana project management platform',
      longDesc:
        'Connect to Asana to automate task management, project monitoring, and team collaboration workflows. Use these triggers to respond to changes in tasks, projects, and workspaces.',
      triggers: {
        task_completed: {
          displayName: 'Task Completed',
          shortDesc: 'Triggers when a task is marked complete in a specific project',
          longDesc:
            'Initiates a workflow when any task within the specified project is marked as completed. Use this to automate follow-up actions or notifications upon task completion.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the completed tasks',
              longDesc:
                'The unique identifier of the project where task completions will be monitored',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
          },
          event_info: AsanaEventInfo,
        },
        attachment_added: {
          displayName: 'Attachment Added',
          shortDesc: 'Triggers when an attachment is uploaded to a task',
          longDesc:
            'Initiates a workflow when a file is attached to any task within the specified project. Optionally filter by a specific task. Use this to process or track files as they are added to tasks.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the tasks with attachments',
              longDesc:
                'The unique identifier of the project where attachment activities will be monitored',
            },
            task: {
              displayName: 'Task ID (Optional)',
              shortDesc: 'Specific task to monitor for attachments',
              longDesc:
                'The unique identifier of a specific task to monitor. If not provided, attachments from all tasks in the project will trigger the workflow',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
          },
          event_info: AsanaEventInfo,
        },
        subtask_completed: {
          displayName: 'Subtask Completed',
          shortDesc: 'Triggers when a subtask is marked complete',
          longDesc:
            'Initiates a workflow when a subtask within a specific parent task is marked as completed. Use this to track progress on multi-stage tasks or to trigger the next steps in a workflow.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the parent task',
              longDesc: 'The unique identifier of the project where the parent task exists',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
            task: {
              displayName: 'Parent Task ID',
              shortDesc: 'The parent task containing the subtasks',
              longDesc:
                'The unique identifier of the parent task whose subtasks will be monitored for completion',
            },
          },
          event_info: AsanaEventInfo,
        },
        project_task_added: {
          displayName: 'Project Task Added',
          shortDesc: 'Triggers when a new task is created in a project',
          longDesc:
            'Initiates a workflow whenever a new task is added to the specified project. Use this to automatically process, categorize, or assign new tasks as they are created.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to monitor for new tasks',
              longDesc:
                'The unique identifier of the project where new task creation will be monitored',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
          },
          event_info: AsanaEventInfo,
        },
        project_added: {
          displayName: 'Project Added',
          shortDesc: 'Triggers when a new project is created in a workspace',
          longDesc:
            'Initiates a workflow whenever a new project is created within the specified workspace. Use this to automate project setup, create standard templates, or notify team members about new initiatives.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to monitor for new projects',
              longDesc:
                'The unique identifier of the workspace where new project creation will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_comment_added: {
          displayName: 'Task Comment Added',
          shortDesc: 'Triggers when a comment is added to a specific task',
          longDesc:
            'Initiates a workflow when a new comment is posted on the specified task. Use this to monitor discussions, notify stakeholders, or track communication around critical tasks.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the task',
              longDesc: 'The unique identifier of the project where the task exists',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The specific task to monitor for comments',
              longDesc: 'The unique identifier of the task where comments will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_story_added: {
          displayName: 'Task Story Added',
          shortDesc: 'Triggers when any activity occurs on a task',
          longDesc:
            'Initiates a workflow when any story (comment, status update, field change) is added to a task. This captures all activity including automated system updates. Use this for comprehensive task activity monitoring.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the task',
              longDesc: 'The unique identifier of the project where the task exists',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The specific task to monitor for activity',
              longDesc: 'The unique identifier of the task where all activity will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_subtask_added: {
          displayName: 'Task Subtask Added',
          shortDesc: 'Triggers when a subtask is created under a parent task',
          longDesc:
            'Initiates a workflow when a new subtask is added to the specified parent task. Use this to track task breakdown or to automate subtask assignments and deadlines.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the parent task',
              longDesc: 'The unique identifier of the project where the parent task exists',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
            task: {
              displayName: 'Parent Task ID',
              shortDesc: 'The parent task to monitor for new subtasks',
              longDesc:
                'The unique identifier of the parent task where subtask creation will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_tag_added: {
          displayName: 'Task Tag Added',
          shortDesc: 'Triggers when a tag is applied to a task',
          longDesc:
            'Initiates a workflow when a tag is added to the specified task. Use this to automate actions based on task categorization or to monitor how tasks are being classified.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the task',
              longDesc: 'The unique identifier of the project where the task exists',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The specific task to monitor for tag additions',
              longDesc: 'The unique identifier of the task where tag additions will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        team_added: {
          displayName: 'Team Added',
          shortDesc: 'Triggers when a new team is created in a workspace',
          longDesc:
            'Initiates a workflow when a new team is formed within the specified workspace. Use this to automate team onboarding processes or to set up default team resources.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to monitor for new teams',
              longDesc:
                'The unique identifier of the workspace where new team creation will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        user_added: {
          displayName: 'User Added',
          shortDesc: 'Triggers when a user joins a workspace',
          longDesc:
            'Initiates a workflow when a new user is added to the specified workspace. Use this to automate user onboarding, permission assignments, or welcome notifications.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to monitor for new users',
              longDesc:
                'The unique identifier of the workspace where new user additions will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        tag_created: {
          displayName: 'Tag Created',
          shortDesc: 'Triggers when a new tag is created in a workspace',
          longDesc:
            'Initiates a workflow when a new tag is created within the specified workspace. Use this to monitor taxonomy changes or to standardize tag usage across projects.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to monitor for new tags',
              longDesc:
                'The unique identifier of the workspace where new tag creation will be monitored',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_moved_to_section: {
          displayName: 'Task Moved to Section',
          shortDesc: 'Triggers when a task is moved to a different section',
          longDesc:
            'Initiates a workflow when a task is moved between sections in the specified project. Use this to track task progress through different stages or to automate actions based on task status changes.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project containing the sections and tasks',
              longDesc:
                'The unique identifier of the project where task movements between sections will be monitored',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace containing the project',
              longDesc: 'The unique identifier of the workspace where the project exists',
            },
          },
          event_info: AsanaEventInfo,
        },
      },
    },
    DocusignESignature: {
      displayName: 'Docusign eSignature',
      shortDesc: 'Collection of actions to interact with the Docusign eSignature API',
      longDesc: 'Collection of actions to interact with the Docusign eSignature API',
      actions: {
        Brands_GetBrands: {
          displayName: 'Get Brands',
        },
        Brands_PostBrands: {
          displayName: 'Create Brand',
        },
        Brands_DeleteBrands: {
          displayName: 'Delete Brand',
        },
        Envelopes_GetEnvelopes: {
          displayName: 'Get Envelopes',
        },
        Envelopes_PostEnvelopes: {
          displayName: 'Create Envelopes',
        },
        Envelopes_GetEnvelope: {
          displayName: 'Get Envelope',
        },
        Envelopes_PutEnvelope: {
          displayName: 'Update Envelope',
        },
        Documents_GetDocuments: {
          displayName: 'Get Documents',
        },
        Documents_PutDocuments: {
          displayName: 'Update Documents',
        },
        Documents_DeleteDocuments: {
          displayName: 'Delete Documents',
        },
        Documents_GetDocument: {
          displayName: 'Get Document',
        },
        Documents_PutDocument: {
          displayName: 'Update Document',
        },
        Recipients_GetRecipients: {
          displayName: 'Get Recipients',
        },
        Recipients_PutRecipients: {
          displayName: 'Update Recipients',
        },
        Recipients_PostRecipients: {
          displayName: 'Add Recipients',
        },
        Recipients_DeleteRecipients: {
          displayName: 'Delete Recipients',
        },
        Views_PostEnvelopeRecipientView: {
          displayName: 'Create Recipient View',
        },
      },
      triggers: {
        envelope_status_updated: {
          displayName: 'Envelope Status Updated',
          shortDesc: `Triggers whenever a DocuSign envelope's status or properties are updated, including events like it being sent, delivered, signed, completed, declined, voided, corrected, purged, or deleted.`,
          longDesc:
            'This trigger activates whenever there’s a change in a DocuSign envelope’s lifecycle. It listens for a variety of updates, such as when an envelope is sent to recipients, delivered, signed, completed, or declined. It also includes administrative events like envelopes being resent, corrected, purged, deleted, discarded, newly created, or removed. By setting up this trigger, you can stay informed of envelope progress and status changes, enabling timely follow-ups, record-keeping, or other automated actions in your workflow.',
          options: {
            accountId: {
              displayName: 'Default Account ID',
              shortDesc: 'The default account ID set when the connection is authorized',
              longDesc: 'The default account ID set when the connection is authorized',
            },
          },
          event_info: {
            desc: 'DocuSign envelope status update event data',
          },
        },
        template_updated: {
          displayName: 'Template Updated',
          shortDesc: `Triggers whenever a new DocuSign template is created, updated or deleted, allowing you to take immediate action in response to the new template.`,
          options: {
            accountId: {
              displayName: 'Default Account ID',
              shortDesc: 'The default account ID set when the connection is authorized',
              longDesc: 'The default account ID set when the connection is authorized',
            },
          },
          event_info: {
            desc: 'DocuSign template update event data',
          },
        },
      },
    },
    Zendesk: {
      displayName: 'Zendesk',
      shortDesc: 'Collection of actions to interact with the Zendesk API',
      longDesc: 'Collection of actions to interact with the Zendesk API',
      triggers: {
        new_user: {
          displayName: 'New User',
          shortDesc: 'Triggers when a new user is created',
          longDesc: 'Triggers when a new user is created',
          event_info: {
            desc: 'Zendesk User Event Data',
            type: {
              fields: {
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'Account ID',
                  longDesc: 'ID of the associated account',
                },
                detail: {
                  displayName: 'Detail',
                  shortDesc: 'User details',
                  longDesc: 'Detailed user information',
                  type: {
                    fields: {
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'User creation time',
                        longDesc: 'Timestamp of user creation',
                      },
                      default_group_id: {
                        displayName: 'Default Group ID',
                        shortDesc: 'Default group ID',
                        longDesc: 'ID of the default group for the user',
                      },
                      email: {
                        displayName: 'Email',
                        shortDesc: 'User email',
                        longDesc: 'Email address of the user',
                      },
                      external_id: {
                        displayName: 'External ID',
                        shortDesc: 'User external ID',
                        longDesc: 'External identifier for the user',
                      },
                      id: {
                        displayName: 'User ID',
                        shortDesc: 'User ID',
                        longDesc: 'Unique identifier for the user',
                      },
                      organization_id: {
                        displayName: 'Organization ID',
                        shortDesc: 'Organization ID',
                        longDesc: 'ID of the organization associated with the user',
                      },
                      role: {
                        displayName: 'Role',
                        shortDesc: 'User role',
                        longDesc: 'Role of the user in the system',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'User update time',
                        longDesc: 'Last update timestamp for the user',
                      },
                    },
                  },
                },
                event: {
                  displayName: 'Event',
                  shortDesc: 'Event info',
                  longDesc: 'Additional event information',
                },
                id: {
                  displayName: 'Event ID',
                  shortDesc: 'Event ID',
                  longDesc: 'Unique identifier for the event',
                },
                subject: {
                  displayName: 'Subject',
                  shortDesc: 'Event subject',
                  longDesc: 'Subject of the event',
                },
                time: {
                  displayName: 'Time',
                  shortDesc: 'Event time',
                  longDesc: 'Timestamp of the event occurrence',
                },
                type: {
                  displayName: 'Event Type',
                  shortDesc: 'Event type',
                  longDesc: 'Type of the event',
                },
                zendesk_event_version: {
                  displayName: 'Zendesk Event Version',
                  shortDesc: 'Event version',
                  longDesc: 'Version of the Zendesk event format',
                },
              },
            },
          },
        },
        new_ticket: {
          displayName: 'New Ticket',
          shortDesc: 'Triggers when a new ticket is created',
          longDesc: 'Triggers when a new ticket is created',
          event_info: {
            desc: 'New Ticket Event Data',
            type: {
              fields: {
                assignee_email: {
                  displayName: 'Assignee Email',
                  shortDesc: 'Assignee email',
                  longDesc: 'Email of the assignee',
                },
                assignee_name: {
                  displayName: 'Assignee Name',
                  shortDesc: 'Assignee name',
                  longDesc: 'Name of the assignee',
                },
                group_name: {
                  displayName: 'Group Name',
                  shortDesc: 'Group name',
                  longDesc: 'Name of the group handling the ticket',
                },
                organization_name: {
                  displayName: 'Organization Name',
                  shortDesc: 'Organization name',
                  longDesc: 'Name of the associated organization',
                },
                requester_email: {
                  displayName: 'Requester Email',
                  shortDesc: 'Requester email',
                  longDesc: 'Email of the requester',
                },
                requester_name: {
                  displayName: 'Requester Name',
                  shortDesc: 'Requester name',
                  longDesc: 'Name of the requester',
                },
                tags: {
                  displayName: 'Tags',
                  shortDesc: 'Ticket tags',
                  longDesc: 'Tags associated with the ticket',
                },
                ticket_description: {
                  displayName: 'Ticket Description',
                  shortDesc: 'Ticket description',
                  longDesc: 'Description of the ticket',
                },
                ticket_id: {
                  displayName: 'Ticket ID',
                  shortDesc: 'Ticket ID',
                  longDesc: 'Unique identifier for the ticket',
                },
                ticket_priority: {
                  displayName: 'Ticket Priority',
                  shortDesc: 'Ticket priority',
                  longDesc: 'Priority level of the ticket',
                },
                ticket_status: {
                  displayName: 'Ticket Status',
                  shortDesc: 'Ticket status',
                  longDesc: 'Current status of the ticket',
                },
                ticket_subject: {
                  displayName: 'Ticket Subject',
                  shortDesc: 'Ticket subject',
                  longDesc: 'Subject of the ticket',
                },
                ticket_type: {
                  displayName: 'Ticket Type',
                  shortDesc: 'Ticket type',
                  longDesc: 'Type of the ticket',
                },
                ticket_url: {
                  displayName: 'Ticket URL',
                  shortDesc: 'Ticket URL',
                  longDesc: 'URL of the ticket in the system',
                },
              },
            },
          },
        },
        new_organization: {
          displayName: 'New Organization',
          shortDesc: 'Triggers when a new organization is created',
          longDesc: 'Triggers when a new organization is created',
          event_info: {
            desc: 'Zendesk Organization Event Data',
            type: {
              fields: {
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'Account ID',
                  longDesc: 'ID of the associated account',
                },
                detail: {
                  displayName: 'Detail',
                  shortDesc: 'Organization details',
                  longDesc: 'Detailed organization information',
                  type: {
                    fields: {
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'Organization creation time',
                        longDesc: 'Timestamp of organization creation',
                      },
                      external_id: {
                        displayName: 'External ID',
                        shortDesc: 'Organization external ID',
                        longDesc: 'External identifier for the organization',
                      },
                      group_id: {
                        displayName: 'Group ID',
                        shortDesc: 'Group ID',
                        longDesc: 'ID of the associated group',
                      },
                      id: {
                        displayName: 'Organization ID',
                        shortDesc: 'Organization ID',
                        longDesc: 'Unique identifier for the organization',
                      },
                      name: {
                        displayName: 'Name',
                        shortDesc: 'Organization name',
                        longDesc: 'Name of the organization',
                      },
                      shared_comments: {
                        displayName: 'Shared Comments',
                        shortDesc: 'Shared comments',
                        longDesc: 'Indicates if comments are shared',
                      },
                      shared_tickets: {
                        displayName: 'Shared Tickets',
                        shortDesc: 'Shared tickets',
                        longDesc: 'Indicates if tickets are shared',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'Organization update time',
                        longDesc: 'Last update timestamp for the organization',
                      },
                    },
                  },
                },
                event: {
                  displayName: 'Event',
                  shortDesc: 'Event info',
                  longDesc: 'Additional event information',
                },
                id: {
                  displayName: 'Event ID',
                  shortDesc: 'Event ID',
                  longDesc: 'Unique identifier for the event',
                },
                subject: {
                  displayName: 'Subject',
                  shortDesc: 'Event subject',
                  longDesc: 'Subject of the event',
                },
                time: {
                  displayName: 'Time',
                  shortDesc: 'Event time',
                  longDesc: 'Timestamp of the event occurrence',
                },
                type: {
                  displayName: 'Event Type',
                  shortDesc: 'Event type',
                  longDesc: 'Type of the event',
                },
                zendesk_event_version: {
                  displayName: 'Zendesk Event Version',
                  shortDesc: 'Event version',
                  longDesc: 'Version of the Zendesk event format',
                },
              },
            },
          },
        },
      },
      actions: {
        CreateGroup: {
          options: {
            group: {
              displayName: 'Group',
              shortDesc: 'Group',
              longDesc: 'Group',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: 'Group name',
                    longDesc: 'Group name',
                  },
                  description: {
                    displayName: 'Description',
                    shortDesc: 'Group description',
                    longDesc: 'Group description',
                  },
                  default: {
                    displayName: 'Default',
                    shortDesc: 'Default group assignment for team members in Zendesk.',
                    longDesc:
                      'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  },
                  is_public: {
                    displayName: 'Public',
                    shortDesc: 'Public group visibility',
                    longDesc: 'Indicates if the group should be public. Default is true.',
                  },
                  user_ids: {
                    displayName: 'User IDs',
                    shortDesc: 'Users to add to the group',
                    longDesc: 'List of user IDs to be added to the group',
                  },
                },
              },
            },
          },
        },
        UpdateGroup: {
          options: {
            group_id: {
              displayName: 'Group ID',
              shortDesc: 'Group ID',
              longDesc: 'Group ID',
            },
            group: {
              displayName: 'Group',
              shortDesc: 'Group information',
              longDesc: 'Details about the group settings in Zendesk',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: 'Group name',
                    longDesc: 'The name of the group',
                  },
                  description: {
                    displayName: 'Description',
                    shortDesc: 'Group description',
                    longDesc: 'A description of the group',
                  },
                  default: {
                    displayName: 'Default',
                    shortDesc: 'Default group assignment',
                    longDesc:
                      'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  },
                  is_public: {
                    displayName: 'Public',
                    shortDesc: 'Public group visibility',
                    longDesc: 'Indicates whether the group should be public. Default is true.',
                  },
                  user_ids: {
                    displayName: 'User IDs',
                    shortDesc: 'List of user IDs',
                    longDesc: 'The IDs of users to be added to the group',
                  },
                },
              },
            },
          },
        },
        CreateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User information',
              longDesc: 'Details about the user in Zendesk',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: "User's name",
                    longDesc: 'The full name of the user',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: "User's email address",
                    longDesc: 'The email address associated with the user',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: "User's phone number",
                    longDesc: 'The phone number associated with the user',
                  },
                  notes: {
                    displayName: 'Notes',
                    shortDesc: 'User notes',
                    longDesc: 'Additional notes or comments about the user',
                  },
                  details: {
                    displayName: 'Details',
                    shortDesc: 'Additional details',
                    longDesc: 'Detailed information about the user',
                  },
                  role: {
                    displayName: 'Role',
                    shortDesc: 'User role',
                    longDesc: 'The role assigned to the user in the system',
                  },
                  organization_ids: {
                    displayName: 'Organization IDs',
                    shortDesc: 'List of organization IDs',
                    longDesc: 'The IDs of the organizations the user is associated with',
                  },
                },
              },
            },
          },
        },
        UpdateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User information',
              longDesc: 'Details about the user in the Zendesk system',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: "User's name",
                    longDesc: 'The full name of the user',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: "User's email address",
                    longDesc: 'The email address associated with the user',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: "User's phone number",
                    longDesc: 'The phone number associated with the user',
                  },
                  notes: {
                    displayName: 'Notes',
                    shortDesc: 'User notes',
                    longDesc: 'Additional notes or comments about the user',
                  },
                  details: {
                    displayName: 'Details',
                    shortDesc: 'Additional details',
                    longDesc: 'Additional detailed information about the user',
                  },
                  role: {
                    displayName: 'Role',
                    shortDesc: 'User role',
                    longDesc: 'The role assigned to the user within the system',
                  },
                  organization_ids: {
                    displayName: 'Organization IDs',
                    shortDesc: 'List of organization IDs',
                    longDesc: 'The IDs of the organizations the user is associated with',
                  },
                },
              },
            },
          },
        },
        UpdateOrganization: {
          options: {
            name: {
              displayName: 'Name',
              shortDesc: 'Organization name',
              longDesc: 'Organization name',
            },
            group_id: {
              displayName: 'Group ID',
              shortDesc: 'Group ID',
              longDesc: 'Group ID',
            },
            notes: {
              displayName: 'Notes',
              shortDesc: 'Notes about the organization',
              longDesc: 'Notes about the organization',
            },
            details: {
              displayName: 'Details',
              shortDesc: 'Details',
              longDesc: 'Details',
            },
          },
        },
      },
    },
    Hubspot: {
      displayName: 'HubSpot',
      shortDesc:
        'Seamlessly connect to the HubSpot API to automate and streamline your CRM processes.',
      longDesc:
        'The HubSpot integration provides a comprehensive collection of actions and triggers to interact with the HubSpot API. Whether you need to manage companies, contacts, deals, or custom objects, this integration simplifies your workflow automation and CRM management.',
      actions: {
        'post-crm-v3-objects-companies-batch-upsert_upsert': {
          displayName: 'Create Or Update Companies',
          shortDesc: 'Create or update multiple companies',
        },
        'get-crm-v3-objects-contacts': {
          displayName: 'List Contacts',
          shortDesc: 'Retrieve a list of contacts',
        },
        'post-crm-v3-objects-contacts': {
          displayName: 'Create Contact',
          shortDesc: 'Create a new contact',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-contacts-search': {
          displayName: 'Search Contacts',
          shortDesc: 'Search for contacts based on specific criteria',
          longDesc: 'Search for contacts based on specific criteria',
        },
        'delete-crm-v3-objects-contacts-contactId': {
          displayName: 'Delete Contact',
          shortDesc: 'Soft delete a selected contact',
        },
        'get-crm-v3-objects-contacts-contactId': {
          displayName: 'Retrieve Contact',
          shortDesc: 'Retrieve a specific contact',
        },
        'patch-crm-v3-objects-contacts-contactId': {
          displayName: 'Update Contact',
          shortDesc: 'Update an existing contact',
        },
        'get-crm-v3-objects-objectType_getPage': {
          displayName: 'List Custom Objects',
          shortDesc: 'Retrieve a list of selected custom objects',
        },
        'post-crm-v3-objects-objectType_create': {
          displayName: 'Create Custom Object',
          shortDesc: 'Create a new custom object of a selected type',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-objectType-batch-upsert': {
          displayName: 'Create Or Update Custom Objects',
        },
        'post-crm-v3-objects-objectType-search_doSearch': {
          displayName: 'Search Custom Objects',
          shortDesc: 'Search for custom objects based on specific criteria',
          longDesc: 'Search for custom objects based on specific criteria',
        },
        'delete-crm-v3-objects-objectType-objectId_archive': {
          displayName: 'Delete Custom Object',
          shortDesc: 'Soft delete a selected custom object',
        },
        'get-crm-v3-objects-objectType-objectId_getById': {
          displayName: 'Retrieve Custom Object',
          shortDesc: 'Retrieve a specific custom object',
        },
        'patch-crm-v3-objects-objectType-objectId_update': {
          displayName: 'Update Custom Object',
          shortDesc: 'Update an existing custom object',
        },
        'get-crm-v3-objects-deals_getPage': {
          displayName: 'List Deals',
          shortDesc: 'Retrieve a list of deals',
        },
        'post-crm-v3-objects-deals_create': {
          displayName: 'Create Deal',
          shortDesc: 'Create a new deal',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-deals-batch-upsert_upsert': {
          displayName: 'Create Or Update Deals',
        },
        'post-crm-v3-objects-deals-search_doSearch': {
          displayName: 'Search Deals',
          shortDesc: 'Search for deals based on specific criteria',
          longDesc: 'Search for deals based on specific criteria',
        },
        'delete-crm-v3-objects-deals-dealId_archive': {
          displayName: 'Delete a Deal',
          shortDesc: 'Soft delete a selected deal',
        },
        'get-crm-v3-objects-deals-dealId_getById': {
          displayName: 'Retrieve Deal',
          shortDesc: 'Retrieve a specific deal',
        },
        'patch-crm-v3-objects-deals-dealId_update': {
          displayName: 'Update Deal',
          shortDesc: 'Update an existing deal',
        },
        'get-crm-v3-objects-leads_getPage': {
          displayName: 'List Leads',
          shortDesc: 'Retrieve a list of leads',
        },
        'post-crm-v3-objects-leads_create': {
          displayName: 'Create Lead',
          shortDesc: 'Create a new lead',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-leads-batch-upsert_upsert': {
          displayName: 'Create Or Update Leads',
        },
        'post-crm-v3-objects-leads-search_doSearch': {
          displayName: 'Search Leads',
          shortDesc: 'Search for leads based on specific criteria',
          longDesc: 'Search for leads based on specific criteria',
        },
        'delete-crm-v3-objects-leads-leadsId_archive': {
          displayName: 'Delete Lead',
          shortDesc: 'Soft delete a selected lead',
        },
        'get-crm-v3-objects-leads-leadsId_getById': {
          displayName: 'Retrieve Lead',
          shortDesc: 'Retrieve a specific lead',
        },
        'patch-crm-v3-objects-leads-leadsId_update': {
          displayName: 'Update Lead',
          shortDesc: 'Update an existing lead',
        },
        'get-crm-v3-objects-products_getPage': {
          displayName: 'List Products',
          shortDesc: 'Retrieve a list of products',
        },
        'post-crm-v3-objects-products_create': {
          displayName: 'Create Product',
          shortDesc: 'Create a new product',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-products-batch-upsert_upsert': {
          displayName: 'Create Or Update Products',
        },
        'post-crm-v3-objects-products-search_doSearch': {
          displayName: 'Search Products',
          shortDesc: 'Search for products based on specific criteria',
          longDesc: 'Search for products based on specific criteria',
        },
        'delete-crm-v3-objects-products-productId_archive': {
          displayName: 'Delete Product',
          shortDesc: 'Soft delete a selected product',
        },
        'get-crm-v3-objects-products-productId_getById': {
          displayName: 'Retrieve Product',
          shortDesc: 'Retrieve a specific product',
        },
        'patch-crm-v3-objects-products-productId_update': {
          displayName: 'Update Product',
          shortDesc: 'Update an existing product',
        },
        'get-crm-v3-objects-tickets_getPage': {
          displayName: 'List Tickets',
          shortDesc: 'Retrieve a list of tickets',
        },
        'post-crm-v3-objects-tickets_create': {
          displayName: 'Create Ticket',
          shortDesc: 'Create a new ticket',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-tickets-batch-upsert_upsert': {
          displayName: 'Create Or Update Tickets',
        },
        'post-crm-v3-objects-tickets-search_doSearch': {
          displayName: 'Search Tickets',
          shortDesc: 'Search for tickets based on specific criteria',
          longDesc: 'Search for tickets based on specific criteria',
        },
        'delete-crm-v3-objects-tickets-ticketId_archive': {
          displayName: 'Delete Ticket',
          shortDesc: 'Soft delete a selected ticket',
        },
        'get-crm-v3-objects-tickets-ticketId_getById': {
          displayName: 'Retrieve Ticket',
          shortDesc: 'Retrieve a specific ticket',
        },
        'patch-crm-v3-objects-tickets-ticketId_update': {
          displayName: 'Update Ticket',
          shortDesc: 'Update an existing ticket',
        },
        'get-crm-v3-objects-users': {
          displayName: 'List Users',
          shortDesc: 'Retrieve a list of users',
        },
        'post-crm-v3-objects-users-batch-upsert': {
          displayName: 'Create Or Update Users',
        },
        'post-crm-v3-objects-users-search': {
          displayName: 'Search Users',
          shortDesc: 'Search for users based on specific criteria',
          longDesc: 'Search for users based on specific criteria',
        },
        'get-crm-v3-objects-users-userId': {
          displayName: 'Retrieve User',
          shortDesc: 'Retrieve a specific user',
        },
        'patch-crm-v3-objects-users-userId': {
          displayName: 'Update User',
          shortDesc: 'Update an existing user',
        },
      },
      triggers: {
        hubspot_company_created_or_updated_trigger: {
          event_info: {
            desc: 'Company Information',
          },
          displayName: 'Company Created or Updated',
          shortDesc: 'Triggers when a company is added or updated in HubSpot.',
          longDesc:
            'This trigger activates whenever a company record is created or modified in HubSpot, enabling you to automate workflows based on company data changes.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_contact_created_or_updated_trigger: {
          event_info: {
            desc: 'Contact Information',
          },
          displayName: 'Contact Created or Updated',
          shortDesc: 'Triggers when a contact is added or updated in HubSpot.',
          longDesc:
            'Activate workflows whenever a new contact is created or an existing contact is updated within HubSpot. Ideal for managing customer information efficiently.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_custom_object_created_or_updated_trigger: {
          event_info: {
            desc: 'Custom Object Information',
          },
          displayName: 'Custom Object Created or Updated',
          shortDesc: 'Triggers when a custom object is added or updated in HubSpot.',
          longDesc:
            'Use this trigger to capture changes to custom objects in HubSpot, ensuring that updates to custom data structures are processed immediately for automation or integration.',
          options: {
            ...HubspotTriggerOptionsEn,
            object: {
              displayName: 'Object',
              shortDesc: 'The custom object to monitor for changes.',
              longDesc: 'Select the custom object you want to monitor for new or updated records.',
            },
          },
        },
        hubspot_deal_created_or_updated_trigger: {
          event_info: {
            desc: 'Deal Information',
          },
          displayName: 'Deal Created or Updated',
          shortDesc: 'Triggers when a deal is created or updated in HubSpot.',
          longDesc:
            'This trigger fires when a deal is created or modified in HubSpot, allowing you to track sales opportunities and integrate with your sales pipeline automation workflows.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_lead_created_or_updated_trigger: {
          event_info: {
            desc: 'Lead Information',
          },
          displayName: 'Lead Created or Updated',
          shortDesc: 'Triggers when a lead is added or updated in HubSpot.',
          longDesc:
            'Monitor new leads and updates to existing leads in HubSpot with this trigger, enabling efficient lead management and follow-up processes.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_product_created_or_updated_trigger: {
          event_info: {
            desc: 'Product Information',
          },
          displayName: 'Product Created or Updated',
          shortDesc: 'Triggers when a product is added or updated in HubSpot.',
          longDesc:
            'This trigger alerts you to any new or updated products within your HubSpot account, ensuring that your product data remains synchronized with your workflows and external systems.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_ticket_created_or_updated_trigger: {
          event_info: {
            desc: 'Ticket Information',
          },
          displayName: 'Ticket Created or Updated',
          shortDesc: 'Triggers when a support ticket is created or updated in HubSpot.',
          longDesc:
            'Automatically trigger workflows when a support ticket is created or updated in HubSpot, ideal for managing customer support operations and streamlining issue resolution.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_user_created_or_updated_trigger: {
          event_info: {
            desc: 'User Information',
          },
          displayName: 'User Created or Updated',
          shortDesc: 'Triggers when a user is added or updated in HubSpot.',
          longDesc:
            'This trigger fires upon the creation or update of a user within HubSpot, helping you keep track of user accounts and maintain updated access control for your team.',
          options: HubspotTriggerOptionsEn,
        },
      },
    },
    Dropbox: {
      displayName: 'Dropbox',
      shortDesc:
        'A cloud storage service that lets you save files online and sync them to your devices.',
      longDesc:
        'Dropbox is a cloud-based file storage solution that allows users to store and share files and folders with others across the internet using file synchronization. It offers features like file sharing, collaboration, and access from multiple devices.',
      triggers: {
        new_file_in_folder: {
          displayName: 'New File in Folder',
          shortDesc: 'Triggers when a new file is added to a specified folder.',
          longDesc: 'This trigger fires every time a new file is saved in the folder you specify.',
          options: {
            folder: {
              displayName: 'Folder Path',
              shortDesc: 'The path to the folder to monitor for new files.',
              longDesc: 'Specify the path to the folder you want to monitor for new files. ',
            },
          },
        },
      },
    },
    NetSuite: {
      displayName: 'NetSuite',
      shortDesc: 'A comprehensive suite of cloud-based business management solutions.',
      longDesc:
        'NetSuite offers a unified platform for ERP, CRM, e-commerce, and more, enabling businesses to manage all key operations in a single system.',
      triggers: {
        new_record: {
          displayName: 'New Record',
          shortDesc: 'Triggers when a new record is created',
          longDesc: 'Triggers when a new record is created',
          options: {
            recordType: {
              displayName: 'Record Type',
              shortDesc: 'The type of record to monitor',
              longDesc: 'The type of record to monitor',
            },
          },
        },
      },
      actions: {
        list_records: {
          displayName: 'List Records',
          shortDesc: 'Retrieve NetSuite records based on search criteria',
          longDesc:
            'Query NetSuite records by type with optional filtering, field selection, and pagination',
          options: {
            recordType: {
              displayName: 'Record Type',
              shortDesc: 'Type of NetSuite record to retrieve',
              longDesc:
                'Specifies which NetSuite record type to query (customer, invoice, transaction, etc.)',
            },
            searchMode: {
              displayName: 'Search Mode',
              shortDesc: 'How multiple search criteria are combined',
              longDesc:
                'Determines if records must match all criteria (All) or any criteria (Any) when multiple query fields are provided',
            },
            fields: {
              displayName: 'Fields',
              shortDesc: 'Specific record fields to return',
              longDesc: 'List of field names to include in results (returns all fields if omitted)',
            },
            query: {
              displayName: 'Query Criteria',
              shortDesc: 'Search conditions for filtering records',
              longDesc: 'Key-value pairs defining search criteria',
              type: {
                fields: {
                  key: {
                    displayName: 'Field Name',
                    shortDesc: 'Name of the field to filter by',
                    longDesc: 'The name of the field to filter by',
                  },
                  value: {
                    displayName: 'Field Value',
                    shortDesc: 'Value to match for the field',
                    longDesc: 'The value to match for the field',
                  },
                },
              },
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of records to return',
              longDesc: 'Caps the number of results returned in a single query',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'Number of records to skip',
              longDesc:
                'Used for pagination to skip a specified number of records in the result set',
            },
          },
        },
        suite_ql: {
          displayName: 'SuiteQL',
          shortDesc: 'Run a SuiteQL query',
          longDesc: 'Run a SuiteQL query',
          options: {
            query: {
              displayName: 'Query',
              shortDesc: 'The SuiteQL query to run',
              longDesc: 'The SuiteQL query to run',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of records to return',
              longDesc: 'The maximum number of records to return',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'The number of records to skip',
              longDesc: 'The number of records to skip',
            },
            response_type: {
              fields: {
                links: {
                  display_name: 'Links',
                  short_desc: 'Links',
                  desc: 'Links',
                },
                count: {
                  display_name: 'Count',
                  short_desc: 'The number of results',
                  desc: 'The number of results',
                },
                hasMore: {
                  display_name: 'Has More',
                  short_desc: 'Whether there are more results',
                  desc: 'Whether there are more results',
                },
                items: {
                  display_name: 'Items',
                  short_desc: 'The items',
                  desc: 'The items',
                },
              },
            },
          },
        },
        account_get: {
          displayName: 'Get List of Accounts',
          shortDesc: 'Retrieve a list of accounts.',
          longDesc: 'Fetches a list of accounts based on specified filters.',
        },
        account_post: {
          displayName: 'Create Account',
          shortDesc: 'Creates a new account.',
          longDesc: 'Allows the user to create a new account record in NetSuite.',
        },
        account_id_get: {
          displayName: 'Get Account',
          shortDesc: 'Retrieve details of a specific account.',
          longDesc: 'Fetches detailed information of a single account by its ID.',
        },
        account_id_patch: {
          displayName: 'Update Account',
          shortDesc: 'Updates an existing account.',
          longDesc: 'Allows the user to update details of a specific account by its ID.',
        },
        account_id_delete: {
          displayName: 'Delete Account',
          shortDesc: 'Deletes a specific account.',
          longDesc: 'Removes an account record from NetSuite based on its ID.',
        },
        customer_get: {
          displayName: 'Get List of Customers',
          shortDesc: 'Retrieve a list of customers.',
          longDesc: 'Fetches a list of customers based on specified filters.',
        },
        customer_post: {
          displayName: 'Create Customer',
          shortDesc: 'Creates a new customer.',
          longDesc: 'Allows the user to create a new customer record in NetSuite.',
        },
        customer_id_get: {
          displayName: 'Get Customer',
          shortDesc: 'Retrieve details of a specific customer.',
          longDesc: 'Fetches detailed information of a single customer by its ID.',
        },
        customer_id_patch: {
          displayName: 'Update Customer',
          shortDesc: 'Updates an existing customer.',
          longDesc: 'Allows the user to update details of a specific customer by its ID.',
        },
        customer_id_delete: {
          displayName: 'Delete Customer',
          shortDesc: 'Deletes a specific customer.',
          longDesc: 'Removes a customer record from NetSuite based on its ID.',
        },
        contact_get: {
          displayName: 'Get List of Contacts',
          shortDesc: 'Retrieve a list of contacts.',
          longDesc: 'Fetches a list of contacts based on specified filters.',
        },
        contact_post: {
          displayName: 'Create Contact',
          shortDesc: 'Creates a new contact.',
          longDesc: 'Allows the user to create a new contact record in NetSuite.',
        },
        contact_id_delete: {
          displayName: 'Delete Contact',
          shortDesc: 'Deletes a specific contact.',
          longDesc: 'Removes a contact record from NetSuite based on its ID.',
        },
        contact_id_get: {
          displayName: 'Get Contact',
          shortDesc: 'Retrieve details of a specific contact.',
          longDesc: 'Fetches detailed information of a single contact by its ID.',
        },
        contact_id_patch: {
          displayName: 'Update Contact',
          shortDesc: 'Updates an existing contact.',
          longDesc: 'Allows the user to update details of a specific contact by its ID.',
        },
        opportunity_get: {
          displayName: 'Get List of Opportunities',
          shortDesc: 'Retrieve a list of opportunities.',
          longDesc: 'Fetches a list of opportunities based on specified filters.',
        },
        opportunity_id_delete: {
          displayName: 'Delete Opportunity',
          shortDesc: 'Deletes a specific opportunity.',
          longDesc: 'Removes an opportunity record from NetSuite based on its ID.',
        },
        opportunity_id_get: {
          displayName: 'Get Opportunity',
          shortDesc: 'Retrieve details of a specific opportunity.',
          longDesc: 'Fetches detailed information of a single opportunity by its ID.',
        },
        opportunity_id_patch: {
          displayName: 'Update Opportunity',
          shortDesc: 'Updates an existing opportunity.',
          longDesc: 'Allows the user to update details of a specific opportunity by its ID.',
        },
        opportunity_post: {
          displayName: 'Create Opportunity',
          shortDesc: 'Creates a new opportunity.',
          longDesc: 'Allows the user to create a new opportunity record in NetSuite.',
        },
        invoice_get: {
          displayName: 'Get List of Invoices',
          shortDesc: 'Retrieve a list of invoices.',
          longDesc: 'Fetches a list of invoices based on specified filters.',
        },
        invoice_post: {
          displayName: 'Create Invoice',
          shortDesc: 'Creates a new invoice.',
          longDesc: 'Allows the user to create a new invoice record in NetSuite.',
          options: {
            entity: {
              displayName: 'Customer for the invoice',
              shortDesc: 'The customer for the invoice',
              longDesc: 'The customer for the invoice',
            },
          },
        },
        invoice_id_get: {
          displayName: 'Get Invoice',
          shortDesc: 'Retrieve details of a specific invoice.',
          longDesc: 'Fetches detailed information of a single invoice by its ID.',
        },
        invoice_id_patch: {
          displayName: 'Update Invoice',
          shortDesc: 'Updates an existing invoice.',
          longDesc: 'Allows the user to update details of a specific invoice by its ID.',
        },
        invoice_id_delete: {
          displayName: 'Delete Invoice',
          shortDesc: 'Deletes a specific invoice.',
          longDesc: 'Removes an invoice record from NetSuite based on its ID.',
        },
        journalEntry_get: {
          displayName: 'Get List of Journal Entries',
          shortDesc: 'Retrieve a list of journal entries.',
          longDesc: 'Fetches a list of journal entries based on specified filters.',
        },
        journalEntry_post: {
          displayName: 'Create Journal Entry',
          shortDesc: 'Creates a new journal entry.',
          longDesc: 'Allows the user to create a new journal entry record in NetSuite.',
        },
        journalEntry_id_get: {
          displayName: 'Get Journal Entry',
          shortDesc: 'Retrieve details of a specific journal entry.',
          longDesc: 'Fetches detailed information of a single journal entry by its ID.',
        },
        journal_entry_id_patch: {
          displayName: 'Update Journal Entry',
          shortDesc: 'Updates an existing journal entry.',
          longDesc: 'Allows the user to update details of a specific journal entry by its ID.',
        },
        journalEntry_id_delete: {
          displayName: 'Delete Journal Entry',
          shortDesc: 'Deletes a specific journal entry.',
          longDesc: 'Removes a journal entry record from NetSuite based on its ID.',
        },
        purchaseOrder_get: {
          displayName: 'Get List of Purchase Orders',
          shortDesc: 'Retrieve a list of purchase orders.',
          longDesc: 'Fetches a list of purchase orders based on specified filters.',
        },
        purchaseOrder_post: {
          displayName: 'Create Purchase Order',
          shortDesc: 'Creates a new purchase order.',
          longDesc: 'Allows the user to create a new purchase order record in NetSuite.',
          options: {
            entity: {
              displayName: 'Vendor',
              shortDesc: 'The vendor for the purchase order',
              longDesc: 'The vendor for the purchase order ',
            },
            employee: {
              displayName: 'Employee (Requestor)',
              shortDesc: 'The employee who requested the purchase order',
              longDesc: 'The employee who requested the purchase order',
            },
          },
        },
        purchaseOrder_id_get: {
          displayName: 'Get Purchase Order',
          shortDesc: 'Retrieve details of a specific purchase order.',
          longDesc: 'Fetches detailed information of a single purchase order by its ID.',
        },
        purchaseOrder_id_patch: {
          displayName: 'Update Purchase Order',
          shortDesc: 'Updates an existing purchase order.',
          longDesc: 'Allows the user to update details of a specific purchase order by its ID.',
          options: {
            entity: {
              displayName: 'Vendor',
              shortDesc: 'The vendor for the purchase order',
              longDesc: 'The vendor for the purchase order ',
            },
            employee: {
              displayName: 'Employee (Requestor)',
              shortDesc: 'The employee who requested the purchase order',
              longDesc: 'The employee who requested the purchase order',
            },
          },
        },
        purchaseOrder_id_delete: {
          displayName: 'Delete Purchase Order',
          shortDesc: 'Deletes a specific purchase order.',
          longDesc: 'Removes a purchase order record from NetSuite based on its ID.',
        },
        salesOrder_get: {
          displayName: 'Get List of Sales Orders',
          shortDesc: 'Retrieve a list of sales orders.',
          longDesc: 'Fetches a list of sales orders based on specified filters.',
        },
        salesOrder_post: {
          displayName: 'Create Sales Order',
          shortDesc: 'Creates a new sales order.',
          longDesc: 'Allows the user to create a new sales order record in NetSuite.',
          options: {
            entity: {
              displayName: 'Customer',
              shortDesc: 'The customer for the sales order',
              longDesc: 'The customer for the sales order ',
            },
          },
        },
        customer_post_simplified: {
          displayName: 'Create Customer (Simplified)',
          shortDesc: 'Creates a new customer with simplified options.',
          longDesc: 'Creates a new customer in NetSuite with simplified fields',
          options: {
            entityStatus: {
              displayName: 'Status',
              shortDesc: 'Customer status',
              longDesc: 'The status of the customer (e.g., Active, Inactive)',
            },
            subsidiary: {
              displayName: 'Subsidiary',
              shortDesc: 'The subsidiary for the customer',
              longDesc: 'The subsidiary for the customer',
            },
          },
        },
        salesOrder_post_simplified: {
          displayName: 'Create Sales Order (Simplified)',
          shortDesc: 'Creates a new sales order with simplified options.',
          longDesc:
            'Creates a new customer sales order in NetSuite with only the most commonly used fields, making order creation faster and more straightforward.',
          options: {
            entity: {
              displayName: 'Customer',
              shortDesc: 'Customer for this order',
              longDesc:
                'The NetSuite internal ID of the customer this sales order is for. Must be an existing customer record in your NetSuite account.',
            },
            memo: {
              displayName: 'Memo',
              shortDesc: 'Order notes',
              longDesc:
                'Additional notes or information about this order. This will appear in the memo field on the sales order record.',
            },
            orderStatus: {
              displayName: 'Order Status',
              shortDesc: 'Current status of order',
              longDesc:
                'The processing status of this sales order (e.g., Pending Approval, Pending Fulfillment). Controls workflow and availability for further processing.',
            },
            item: {
              displayName: 'Order Items',
              shortDesc: 'Products or services being ordered',
              longDesc:
                'List of items being purchased in this order. Each item requires an ID and amount',
              type: {
                fields: {
                  id: {
                    displayName: 'Item ID',
                    shortDesc: 'NetSuite item identifier',
                    longDesc:
                      'The internal ID of the inventory item, non-inventory item, service, or other item type in NetSuite that is being ordered.',
                  },
                  quantity: {
                    displayName: 'Quantity',
                    shortDesc: 'Number of units',
                    longDesc:
                      'The number of units being ordered for this line item. For services, this is typically hours or days.',
                  },
                  amount: {
                    displayName: 'Amount Override',
                    shortDesc: 'Custom price (optional)',
                    longDesc:
                      'Optional custom price override for this line item. If provided, overrides the standard price calculation (quantity × rate). Leave empty to use standard pricing from the price level assigned to the customer.',
                  },
                },
              },
            },
          },
        },
        salesOrder_id_get: {
          displayName: 'Get Sales Order',
          shortDesc: 'Retrieve details of a specific sales order.',
          longDesc: 'Fetches detailed information of a single sales order by its ID.',
        },
        salesOrder_id_patch: {
          displayName: 'Update Sales Order',
          shortDesc: 'Updates an existing sales order.',
          longDesc: 'Allows the user to update details of a specific sales order by its ID.',
          options: {
            entity: {
              displayName: 'Customer',
              shortDesc: 'The customer for the sales order',
              longDesc: 'The customer for the sales order ',
            },
          },
        },
        salesOrder_id_delete: {
          displayName: 'Delete Sales Order',
          shortDesc: 'Deletes a specific sales order.',
          longDesc: 'Removes a sales order record from NetSuite based on its ID.',
        },
        vendor_get: {
          displayName: 'Get List of Vendors',
          shortDesc: 'Retrieve a list of vendors.',
          longDesc: 'Fetches a list of vendors based on specified filters.',
        },
        vendor_post: {
          displayName: 'Create Vendor',
          shortDesc: 'Creates a new vendor.',
          longDesc: 'Allows the user to create a new vendor record in NetSuite.',
        },
        vendor_id_get: {
          displayName: 'Get Vendor',
          shortDesc: 'Retrieve details of a specific vendor.',
          longDesc: 'Fetches detailed information of a single vendor by its ID.',
        },
        vendor_id_patch: {
          displayName: 'Update Vendor',
          shortDesc: 'Updates an existing vendor.',
          longDesc: 'Allows the user to update details of a specific vendor by its ID.',
        },
        vendor_id_delete: {
          displayName: 'Delete Vendor',
          shortDesc: 'Deletes a specific vendor.',
          longDesc: 'Removes a vendor record from NetSuite based on its ID.',
        },
      },
    },
    Salesforce: {
      triggers: {
        new_record_trigger: {
          displayName: 'New Record',
          shortDesc: 'Triggers when a new record is created in the specified object.',
          longDesc:
            'This trigger fires whenever a new record is created in a specified Salesforce object. You can configure the object type to target specific record types, such as Leads, Contacts, or custom objects. It is useful for automating workflows triggered by record creation.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Salesforce object to monitor for new records.',
              longDesc:
                'Select the Salesforce object (e.g., Lead, Account, Contact) where this trigger will monitor for newly created records.',
            },
          },
          event_info: {
            desc: 'Fires when a new record is created in the specified Salesforce object.',
          },
        },
        new_contact_trigger: {
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new Contact record is created.',
          longDesc:
            'This trigger fires whenever a new Contact record is created in Salesforce. It is ideal for automating workflows such as contact notifications, integrations, or CRM updates.',
          event_info: {
            desc: 'Fires when a new Contact record is created in Salesforce.',
          },
        },
        new_lead_trigger: {
          displayName: 'New Lead',
          shortDesc: 'Triggers when a new Lead record is created.',
          longDesc:
            'This trigger activates whenever a new Lead record is created in Salesforce. It is commonly used for workflows related to lead generation, qualification, or assignment.',
          event_info: {
            desc: 'Fires when a new Lead record is created in Salesforce.',
          },
        },
        updated_record_trigger: {
          displayName: 'Updated Record',
          shortDesc: 'Triggers when an existing record is updated.',
          longDesc:
            'This trigger fires whenever an existing record in a specified Salesforce object is updated. It is useful for workflows that depend on changes to specific fields or records, such as updating downstream systems or notifying users of record changes.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Salesforce object to monitor for updates.',
              longDesc:
                'Specify the Salesforce object (e.g., Opportunity, Contact, or custom objects) where this trigger will monitor for record updates.',
            },
          },
          event_info: {
            desc: 'Fires when a record in the specified Salesforce object is updated.',
          },
        },
      },
    },
    Freshdesk: {
      displayName: 'Freshdesk',
      shortDesc: 'Cloud-based customer support software',
      longDesc:
        'Freshdesk is a cloud-based customer support platform that was founded with the mission of enabling companies of all sizes to provide great customer service. Our goal is simple: make it easy for brands to talk to their customers and make it easy for users to get in touch with businesses.',
      triggers: {
        new_ticket_trigger: {
          displayName: 'New Ticket',
          shortDesc: 'Triggers when a new ticket is created in Freshdesk.',
          longDesc:
            'Fires whenever a new ticket is created in your Freshdesk instance. You can capture details such as subject, description, priority, and more, and use this data in subsequent actions or notifications.',
          options: {
            ticketStatus: {
              displayName: 'Ticket Status Filter',
              shortDesc: 'Filters by ticket status',
              longDesc:
                'Restrict or filter the trigger to only fire for tickets matching a certain status (e.g. Open, Pending, Resolved, etc.).',
            },
            ticketPriority: {
              displayName: 'Ticket Priority Filter',
              shortDesc: 'Filters by ticket priority',
              longDesc:
                'Restrict or filter the trigger to only fire for tickets matching a certain priority (e.g. Low, Medium, High).',
            },
          },
          event_info: {
            desc: 'Structure and types for Freshdesk’s new ticket data payload.',
          },
        },

        new_contact_trigger: {
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new contact is created in Freshdesk.',
          longDesc:
            'Fires whenever a new contact is added to your Freshdesk instance. Capture details such as name, email, phone, and any custom fields associated with the contact.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s new contact data payload.',
          },
        },

        updated_ticket_trigger: {
          displayName: 'Updated Ticket',
          shortDesc: 'Triggers when an existing ticket is updated in Freshdesk.',
          longDesc:
            'Fires whenever an existing ticket is updated with new details in your Freshdesk instance. For example, changes to subject, priority, status, or assigned agent.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s updated ticket data payload.',
          },
        },

        updated_contact_trigger: {
          displayName: 'Updated Contact',
          shortDesc: 'Triggers when an existing contact is updated in Freshdesk.',
          longDesc:
            'Fires whenever an existing contact’s details are updated in your Freshdesk instance. For example, changes to name, phone number, email, or custom fields.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s updated contact data payload.',
          },
        },
      },
    },
    SharePoint: {
      displayName: 'Microsoft SharePoint',
      shortDesc: 'Connect, automate, and manage your SharePoint Online workflows with ease.',
      longDesc:
        'Integrate your Microsoft 365 environment to quickly create, update, and synchronize documents, lists, and other assets—all from one secure, user-friendly app.',
      triggers: {
        'new-row': {
          displayName: 'New Row',
          shortDesc: 'Triggers when a new row is added to a SharePoint list.',
          longDesc:
            'This trigger activates whenever a new row is added to a specified SharePoint list.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the target list resides. This ID ensures that the trigger is activated in the correct SharePoint site.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the SharePoint list where the new row will be added.',
            },
          },
        },
      },
      actions: {
        'create-folder': {
          displayName: 'Create Folder',
          shortDesc: 'Create a new folder in a specified SharePoint drive.',
          longDesc:
            'This action creates a new folder within a specified SharePoint document library. Provide the target site, drive, parent folder path, and the desired folder name to organize your files effectively.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the unique Site ID where the folder will be created. This ID is required to target the correct SharePoint site in your Microsoft 365 environment.',
            },
            drive_id: {
              displayName: 'Drive ID',
              shortDesc: 'The unique identifier for the SharePoint drive.',
              longDesc:
                'Specify the Drive ID corresponding to the document library in which the folder will be created.',
            },
            parent_folder: {
              displayName: 'Parent Folder Path',
              shortDesc: 'The path of the existing parent folder.',
              longDesc:
                'Provide the path of the parent folder where the new folder should reside. This helps maintain an organized folder structure within your SharePoint drive.',
            },
            folder_name: {
              displayName: 'Folder Name',
              shortDesc: 'The name for the new folder.',
              longDesc:
                'Enter the desired name for the new folder. This name will be used as the folder title in SharePoint.',
            },
          },
        },
        'create-list-item': {
          displayName: 'Create List Item',
          shortDesc: 'Add a new item to an existing SharePoint list.',
          longDesc:
            'This action creates a new item within a specified SharePoint list. Provide the Site ID and List ID to target the correct list, and include the necessary fields to populate the item data.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where your target list resides. This ID ensures that the action is executed in the correct SharePoint environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the SharePoint list to which the new item will be added.',
            },
          },
        },
        'create-list': {
          displayName: 'Create List',
          shortDesc: 'Generate a new list within a SharePoint site.',
          longDesc:
            'This action creates a new SharePoint list. Provide the Site ID, a name for the list, and a description if needed. This is ideal for setting up new data repositories in your SharePoint site.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the new list should be created, ensuring the list is added to the correct SharePoint site.',
            },
            list_name: {
              displayName: 'List Name',
              shortDesc: 'The name of the new list.',
              longDesc:
                'Provide a name for your new list. This name will be visible to users and used to identify the list within SharePoint.',
            },
            list_description: {
              displayName: 'List Description',
              shortDesc: 'A brief description of the list.',
              longDesc:
                'Enter a description for the new list to provide context about its purpose and contents. This helps users understand what the list is used for.',
            },
          },
        },
        'delete-list-item': {
          displayName: 'Delete List Item',
          shortDesc: 'Remove an item from a SharePoint list.',
          longDesc:
            'This action deletes a specific item from a SharePoint list. Provide the Site ID, List ID, and the Item ID of the list item to be removed. Use this action with caution, as deleted items cannot be easily recovered.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is hosted, ensuring the deletion is performed in the correct SharePoint environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the target SharePoint list from which the item will be deleted.',
            },
            item_id: {
              displayName: 'Item ID',
              shortDesc: 'The unique identifier for the list item.',
              longDesc:
                'Provide the Item ID of the list item that you want to delete. This ensures that the correct item is removed from the list.',
            },
          },
        },
        'search-list-item': {
          displayName: 'Search List Item',
          shortDesc: 'Search for items in a SharePoint list by title.',
          longDesc:
            'This action searches for list items within a specified SharePoint list that match a provided title or search term. Use this action to quickly locate specific items based on their Title field.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is located, ensuring the search is conducted in the correct SharePoint site.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc: 'Provide the List ID of the SharePoint list to be searched.',
            },
            search_value: {
              displayName: 'Search Value',
              shortDesc: 'The search term to filter list items.',
              longDesc:
                'Enter the text value to search for within the list items, particularly in the Title field. This value is used to filter and return matching items.',
            },
          },
        },
        'update-list-item': {
          displayName: 'Update List Item',
          shortDesc: 'Modify an existing item in a SharePoint list.',
          longDesc:
            'This action updates the fields of an existing list item in a SharePoint list. Provide the Site ID, List ID, and Item ID to locate the item, along with the new field values that should be applied.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is hosted. This identifies the correct SharePoint site in your Microsoft 365 environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Provide the List ID of the target SharePoint list that contains the item you wish to update.',
            },
            item_id: {
              displayName: 'Item ID',
              shortDesc: 'The unique identifier for the list item.',
              longDesc:
                'Specify the Item ID of the list item that you want to update. This ensures that the correct item is modified.',
            },
          },
        },
      },
    },
    Outlook: {
      displayName: 'Microsoft Outlook',
      shortDesc: 'Get access to your calendar events, contacts, and emails in Microsoft Outlook.',
      longDesc:
        'Microsoft Outlook is a personal information manager software system from Microsoft, available as a part of the Microsoft Office suite. Primarily an email application, it also includes a calendar, task manager, contact manager, note taking, journal, and web browsing. Connect your Outlook account to create and manage contacts, calendar events, and send emails.',
      actions: {
        'manage-email': {
          displayName: 'Manage Email',
          shortDesc: 'Delete or move an email message to another folder.',
          longDesc:
            'Performs operations on an existing email message, allowing you to either delete it permanently or move it to another folder in your Outlook mailbox.',
          options: {
            messageId: {
              displayName: 'Message ID',
              shortDesc: 'ID of the email message',
              longDesc: 'The unique identifier of the email message to be moved or deleted.',
            },
            action: {
              displayName: 'Action',
              shortDesc: 'Action to perform on the email',
              longDesc:
                'Specify whether to delete the email permanently or move it to another folder.',
            },
            targetFolderId: {
              displayName: 'Target Folder ID',
              shortDesc: 'ID of the target folder',
              longDesc:
                'The ID of the folder where you want to move the email. This field is required only when the action is set to "move".',
            },
          },
        },
        'search-emails': {
          displayName: 'Search Emails',
          shortDesc:
            'Search for emails using various filter criteria including advanced attachment filters.',
          longDesc:
            'Search and retrieve emails from Outlook based on dates, senders, recipients, subject, body content, and detailed attachment properties like names, patterns, MIME types, and sizes.',
          options: {
            sort: {
              displayName: 'Sort',
              shortDesc: 'Sort emails by a specific field',
              longDesc:
                'Sort the email results by a specific field. The default is to sort by received date in descending order.',
              type: {
                fields: {
                  field: {
                    displayName: 'Sort Field',
                    shortDesc: 'Field to sort by',
                    longDesc: 'Select the field by which to sort the email results.',
                  },
                  order: {
                    displayName: 'Sort Order',
                    shortDesc: 'Order of sorting',
                    longDesc:
                      'Choose the order in which to sort the results. Options include Ascending and Descending.',
                  },
                },
              },
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'Maximum number of emails to return',
              longDesc: 'Sets the maximum number of email results to return. Default is 50.',
            },
            startDateTime: {
              displayName: 'Start Date',
              shortDesc: 'Filter emails received on or after this date',
              longDesc: 'Only include emails that were received on or after this date and time.',
            },
            endDateTime: {
              displayName: 'End Date',
              shortDesc: 'Filter emails received on or before this date',
              longDesc: 'Only include emails that were received on or before this date and time.',
            },
            fromSender: {
              displayName: 'From Sender',
              shortDesc: 'Filter emails from a specific sender',
              longDesc: 'Only include emails from this specific sender email address.',
            },
            toRecipient: {
              displayName: 'To Recipient',
              shortDesc: 'Filter emails sent to a specific recipient',
              longDesc: 'Only include emails sent to this specific recipient email address.',
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'Filter emails by subject line text',
              longDesc: 'Only include emails with this text in the subject line.',
            },
            hasAttachments: {
              displayName: 'Has Attachments',
              shortDesc: 'Filter emails with or without attachments',
              longDesc:
                'When set to true, only include emails that have attachments. When false, only include emails without attachments.',
            },
            isRead: {
              displayName: 'Is Read',
              shortDesc: 'Filter read or unread emails',
              longDesc:
                'When set to true, only include emails that have been read. When false, only include unread emails.',
            },
            attachmentNames: {
              displayName: 'Attachment Names',
              shortDesc: 'Filter emails by specific attachment names',
              longDesc: 'Only include emails that have attachments with these filenames.',
            },
            bodyContains: {
              displayName: 'Body Contains',
              shortDesc: 'Filter emails by body content',
              longDesc: 'Only include emails that contain this text in the body content.',
            },
            includeAttachments: {
              displayName: 'Include Attachments',
              shortDesc: 'Include attachment content in results',
              longDesc:
                'When set to true, the content of email attachments will be included in the results. This may increase response size significantly.',
            },
            folder: {
              displayName: 'Folder',
              shortDesc: 'Email folder to search in',
              longDesc: 'The email folder to search in. Defaults to Inbox if not specified.',
            },
            attachmentFilenamePattern: {
              displayName: 'Attachment Filename Pattern',
              shortDesc: 'Filter by attachment filename pattern (regex)',
              longDesc:
                'Filter emails by a regular expression pattern that matches attachment filenames. Example: ".*\\.pdf$" would match all PDF files.',
            },
            attachmentMimeTypes: {
              displayName: 'Attachment MIME Types',
              shortDesc: 'Filter by attachment MIME types',
              longDesc:
                'Only include emails with attachments matching these MIME types (e.g., "application/pdf", "image/jpeg").',
            },
            attachmentMinSize: {
              displayName: 'Attachment Minimum Size',
              shortDesc: 'Filter by attachment minimum size in bytes',
              longDesc:
                'Only include emails with attachments larger than or equal to this size in bytes.',
            },
            attachmentMaxSize: {
              displayName: 'Attachment Maximum Size',
              shortDesc: 'Filter by attachment maximum size in bytes',
              longDesc:
                'Only include emails with attachments smaller than or equal to this size in bytes.',
            },
          },
        },
        'create-contact': {
          displayName: 'Create Contact',
          shortDesc: 'Create a new contact in your Outlook contacts.',
          longDesc:
            'Create a new contact with details such as name, email, phone numbers, and job information in your Microsoft Outlook contacts.',
          options: {
            givenName: {
              displayName: 'First Name',
              shortDesc: "The contact's first name.",
              longDesc: 'Enter the first name or given name of the contact.',
            },
            surname: {
              displayName: 'Last Name',
              shortDesc: "The contact's last name.",
              longDesc: 'Enter the last name or surname of the contact.',
            },
            emailAddresses: {
              displayName: 'Email Addresses',
              shortDesc: 'Email addresses for the contact.',
              longDesc: 'Enter one or more email addresses for the contact.',
              type: {
                element_type: {
                  fields: {
                    address: {
                      displayName: 'Email Address',
                      shortDesc: 'The email address of the contact.',
                      longDesc: 'Enter a valid email address for the contact.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: 'The display name for this email address.',
                      longDesc: 'Enter how you want the name to appear for this email address.',
                    },
                  },
                },
              },
            },
            businessPhones: {
              displayName: 'Business Phones',
              shortDesc: 'Business phone numbers for the contact.',
              longDesc: 'Enter one or more business phone numbers for the contact.',
            },
            mobilePhone: {
              displayName: 'Mobile Phone',
              shortDesc: "The contact's mobile phone number.",
              longDesc: 'Enter the mobile or cell phone number for the contact.',
            },
            jobTitle: {
              displayName: 'Job Title',
              shortDesc: "The contact's job title.",
              longDesc: 'Enter the professional title or role of the contact.',
            },
            companyName: {
              displayName: 'Company Name',
              shortDesc: "The name of the contact's company.",
              longDesc: 'Enter the organization or company where the contact works.',
            },
            department: {
              displayName: 'Department',
              shortDesc: "The contact's department.",
              longDesc:
                'Enter the department or division within the company where the contact works.',
            },
            officeLocation: {
              displayName: 'Office Location',
              shortDesc: "The contact's office location.",
              longDesc: 'Enter the physical location or office where the contact works.',
            },
            businessAddress: {
              displayName: 'Business Address',
              shortDesc: "The contact's business address.",
              longDesc: 'Enter the full business address details for the contact.',
              type: {
                fields: {
                  street: {
                    displayName: 'Street',
                    shortDesc: 'Street address.',
                    longDesc: 'Enter the street address including building number and street name.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'City name.',
                    longDesc: 'Enter the city or town for the business address.',
                  },
                  state: {
                    displayName: 'State/Province',
                    shortDesc: 'State or province.',
                    longDesc: 'Enter the state, province, or region for the business address.',
                  },
                  countryOrRegion: {
                    displayName: 'Country/Region',
                    shortDesc: 'Country or region.',
                    longDesc: 'Enter the country or region for the business address.',
                  },
                  postalCode: {
                    displayName: 'Postal Code',
                    shortDesc: 'Postal or zip code.',
                    longDesc: 'Enter the postal code or zip code for the business address.',
                  },
                },
              },
            },
          },
        },
        'update-contact': {
          displayName: 'Update Contact',
          shortDesc: 'Update an existing contact in your Outlook contacts.',
          longDesc:
            'Modify details of an existing contact in your Microsoft Outlook contacts, such as name, email, phone numbers, or job information.',
          options: {
            contactId: {
              displayName: 'Contact ID',
              shortDesc: 'The unique identifier for the contact.',
              longDesc: 'Select the unique identifier of the contact you want to update.',
            },
            givenName: {
              displayName: 'First Name',
              shortDesc: "The contact's first name.",
              longDesc: 'Update the first name or given name of the contact.',
            },
            surname: {
              displayName: 'Last Name',
              shortDesc: "The contact's last name.",
              longDesc: 'Update the last name or surname of the contact.',
            },
            emailAddresses: {
              displayName: 'Email Addresses',
              shortDesc: 'Email addresses for the contact.',
              longDesc: 'Update one or more email addresses for the contact.',
              type: {
                element_type: {
                  fields: {
                    address: {
                      displayName: 'Email Address',
                      shortDesc: 'The email address of the contact.',
                      longDesc: 'Enter a valid email address for the contact.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: 'The display name for this email address.',
                      longDesc: 'Enter how you want the name to appear for this email address.',
                    },
                  },
                },
              },
            },
            businessPhones: {
              displayName: 'Business Phones',
              shortDesc: 'Business phone numbers for the contact.',
              longDesc: 'Update one or more business phone numbers for the contact.',
            },
            mobilePhone: {
              displayName: 'Mobile Phone',
              shortDesc: "The contact's mobile phone number.",
              longDesc: 'Update the mobile or cell phone number for the contact.',
            },
            jobTitle: {
              displayName: 'Job Title',
              shortDesc: "The contact's job title.",
              longDesc: 'Update the professional title or role of the contact.',
            },
            companyName: {
              displayName: 'Company Name',
              shortDesc: "The name of the contact's company.",
              longDesc: 'Update the organization or company where the contact works.',
            },
            department: {
              displayName: 'Department',
              shortDesc: "The contact's department.",
              longDesc:
                'Update the department or division within the company where the contact works.',
            },
            officeLocation: {
              displayName: 'Office Location',
              shortDesc: "The contact's office location.",
              longDesc: 'Update the physical location or office where the contact works.',
            },
            businessAddress: {
              displayName: 'Business Address',
              shortDesc: "The contact's business address.",
              longDesc: 'Update the full business address details for the contact.',
              type: {
                fields: {
                  street: {
                    displayName: 'Street',
                    shortDesc: 'Street address.',
                    longDesc:
                      'Update the street address including building number and street name.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'City name.',
                    longDesc: 'Update the city or town for the business address.',
                  },
                  state: {
                    displayName: 'State/Province',
                    shortDesc: 'State or province.',
                    longDesc: 'Update the state, province, or region for the business address.',
                  },
                  countryOrRegion: {
                    displayName: 'Country/Region',
                    shortDesc: 'Country or region.',
                    longDesc: 'Update the country or region for the business address.',
                  },
                  postalCode: {
                    displayName: 'Postal Code',
                    shortDesc: 'Postal or zip code.',
                    longDesc: 'Update the postal code or zip code for the business address.',
                  },
                },
              },
            },
          },
        },
        'delete-contact': {
          displayName: 'Delete Contact',
          shortDesc: 'Delete a contact from your Outlook contacts.',
          longDesc: 'Permanently remove a contact from your Microsoft Outlook contacts.',
          options: {
            contactId: {
              displayName: 'Contact ID',
              shortDesc: 'The unique identifier for the contact.',
              longDesc: 'Select the unique identifier of the contact to be deleted.',
            },
          },
        },
        'create-event': {
          displayName: 'Create Event',
          shortDesc: 'Create a new event in your Outlook calendar.',
          longDesc:
            'Create a new event or meeting in your Microsoft Outlook calendar with details such as title, start and end times, location, and attendees.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar where the event will be created.',
              longDesc: 'Select the calendar where you want to create the new event.',
            },
            title: {
              displayName: 'Title',
              shortDesc: 'The title or subject of the event.',
              longDesc: 'Enter a title or subject for the event that will appear in your calendar.',
            },
            start: {
              displayName: 'Start Time',
              shortDesc: 'When the event begins.',
              longDesc: 'Enter the date and time when the event will start.',
            },
            timezone: {
              displayName: 'Time Zone',
              shortDesc: 'The time zone for the event times.',
              longDesc:
                'Select the time zone that applies to the start and end times of the event.',
            },
            end: {
              displayName: 'End Time',
              shortDesc: 'When the event ends.',
              longDesc:
                'Enter the date and time when the event will end. If not specified, defaults to 1 hour after start time.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Where the event will take place.',
              longDesc: 'Enter the physical location or virtual meeting place for the event.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'People invited to the event.',
              longDesc: 'Add one or more attendees to invite to the event.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "The attendee's email address.",
                      longDesc: 'Enter the email address of the person you want to invite.',
                    },
                    type: {
                      displayName: 'Attendee Type',
                      shortDesc: 'Required or optional attendee.',
                      longDesc: 'Specify whether this person is a required or optional attendee.',
                    },
                  },
                },
              },
            },
            body: {
              displayName: 'Body',
              shortDesc: 'The body content of the event.',
              longDesc:
                'Enter the description or details of the event that attendees will see in the invitation.',
            },
            bodyContentType: {
              displayName: 'Body Content Type',
              shortDesc: 'Format of the body content.',
              longDesc: 'Select whether the body content is plain text or HTML formatted.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Whether this is an online meeting.',
              longDesc:
                'Enable this option to make this event an online meeting and generate a meeting link.',
            },
          },
        },
        'delete-event': {
          displayName: 'Delete Event',
          shortDesc: 'Delete an event from your Outlook calendar.',
          longDesc: 'Permanently remove an event or meeting from your Microsoft Outlook calendar.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar containing the event.',
              longDesc: 'Select the calendar that contains the event you want to delete.',
            },
            eventId: {
              displayName: 'Event ID',
              shortDesc: 'The unique identifier for the event.',
              longDesc: 'Select the unique identifier of the event to be deleted.',
            },
          },
        },
        'list-contacts': {
          displayName: 'List Contacts',
          shortDesc: 'Retrieve a list of contacts from your Outlook contacts.',
          longDesc:
            'Get a list of contacts from your Microsoft Outlook contacts with optional filtering and limit.',
          options: {
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of contacts to retrieve.',
              longDesc:
                'Specify the maximum number of contacts to retrieve from the Outlook account.',
            },
            filter: {
              displayName: 'Filter',
              shortDesc: 'Filter contacts by name or email.',
              longDesc:
                'Enter text to filter contacts by name or email address. Only contacts matching the filter will be returned.',
            },
          },
        },
        'list-events': {
          displayName: 'List Events',
          shortDesc: 'Retrieve a list of events from your Outlook calendar.',
          longDesc:
            'Get a list of events from your Microsoft Outlook calendar with optional filtering by date range and limit.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar to retrieve events from.',
              longDesc: 'Select the calendar from which you want to retrieve events.',
            },
            startDateTime: {
              displayName: 'Start Date and Time',
              shortDesc: 'The start date and time for filtering events.',
              longDesc:
                'Enter a date and time to retrieve events that start on or after this time.',
            },
            endDateTime: {
              displayName: 'End Date and Time',
              shortDesc: 'The end date and time for filtering events.',
              longDesc: 'Enter a date and time to retrieve events that end on or before this time.',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of events to retrieve.',
              longDesc:
                'Specify the maximum number of events to retrieve from the Outlook calendar.',
            },
          },
        },
        'send-email': {
          displayName: 'Send Email',
          shortDesc: 'Send an email from your Outlook account.',
          longDesc:
            'Compose and send an email message from your Microsoft Outlook account to one or more recipients.',
          options: {
            toRecipients: {
              displayName: 'To Recipients',
              shortDesc: 'The primary recipients of the email.',
              longDesc:
                'Enter one or more email addresses for the primary recipients of the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "Recipient's email address.",
                      longDesc: 'Enter the email address of the recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "Recipient's display name.",
                      longDesc: 'Optionally enter a display name for the recipient.',
                    },
                  },
                },
              },
            },
            ccRecipients: {
              displayName: 'CC Recipients',
              shortDesc: 'The carbon copy recipients of the email.',
              longDesc:
                'Optionally enter one or more email addresses for recipients to be copied on the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "CC recipient's email address.",
                      longDesc: 'Enter the email address of the CC recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "CC recipient's display name.",
                      longDesc: 'Optionally enter a display name for the CC recipient.',
                    },
                  },
                },
              },
            },
            bccRecipients: {
              displayName: 'BCC Recipients',
              shortDesc: 'The blind carbon copy recipients of the email.',
              longDesc:
                'Optionally enter one or more email addresses for recipients to be blind copied on the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "BCC recipient's email address.",
                      longDesc: 'Enter the email address of the BCC recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "BCC recipient's display name.",
                      longDesc: 'Optionally enter a display name for the BCC recipient.',
                    },
                  },
                },
              },
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'The subject line of the email.',
              longDesc: "Enter the subject line that will appear in the recipient's inbox.",
            },
            body: {
              displayName: 'Body',
              shortDesc: 'The content of the email.',
              longDesc: 'Enter the main message content of the email.',
            },
            bodyContentType: {
              displayName: 'Body Content Type',
              shortDesc: 'Format of the email body.',
              longDesc: 'Select whether the email body is plain text or HTML formatted.',
            },
            saveToSentItems: {
              displayName: 'Save to Sent Items',
              shortDesc: 'Whether to save a copy in Sent Items.',
              longDesc: 'Choose whether to save a copy of the email in your Sent Items folder.',
            },
            attachments: {
              displayName: 'Attachments',
              shortDesc: 'Files to attach to the email.',
              longDesc:
                'Optionally attach files to the email. You can add one or more files to be sent with the email.',
            },
          },
        },
      },
      triggers: {
        'new-email-with-attachment': {
          displayName: 'New Email with Attachment',
          shortDesc:
            'Triggers when an email with attachments is received, processing each matching attachment individually.',
          longDesc:
            'Monitors an Outlook mailbox for new emails with attachments. When an email with attachments is received, each attachment that matches the specified filters will trigger a separate event. This allows for processing individual attachments from emails while maintaining the full email context.',
          options: {
            senderFilter: {
              displayName: 'Sender Filter',
              shortDesc: 'Only process emails from this sender',
              longDesc:
                'If specified, only emails from this exact sender email address will be processed. Leave empty to process emails from any sender.',
            },
            subjectFilter: {
              displayName: 'Subject Filter',
              shortDesc: 'Only process emails with this text in the subject',
              longDesc:
                'If specified, only emails containing this text in the subject line will be processed. Leave empty to process emails with any subject.',
            },
            filenameFilters: {
              displayName: 'Filename Filters',
              shortDesc: 'Only process attachments with matching filenames',
              longDesc:
                'A list of text strings to match against attachment filenames. If provided, only attachments with filenames containing any of these strings will be processed. Matching is case-insensitive. Leave empty to process all attachments regardless of filename.',
            },
            mimeTypeFilters: {
              displayName: 'MIME Type Filters',
              shortDesc: 'Only process attachments with matching MIME types',
              longDesc:
                'A list of MIME type strings to match against attachment content types. If provided, only attachments with content types containing any of these strings will be processed. For example, use "pdf" to match PDF files, "image/" to match all images, or "spreadsheet" to match Excel files. Matching is case-insensitive. Leave empty to process all attachments regardless of MIME type.',
            },
            action: {
              displayName: 'Email Action',
              shortDesc: 'Action to perform on the email after processing its attachments',
              longDesc:
                'Specify what should happen to the email after all matching attachments have been processed. Options include: None (leave the email as is), Delete (permanently remove the email), or Move (relocate the email to another folder).',
            },
            targetFolderId: {
              displayName: 'Target Folder',
              shortDesc: 'Destination folder for emails when using Move action',
              longDesc:
                'If the Email Action is set to "Move", specify the folder where the email should be moved after all attachments have been processed. This option is only used when Move is selected.',
            },
          },
          event_info: {
            desc: 'Contains the email data along with information about a single matching attachment.',
          },
        },
        'new-contact': {
          displayName: 'New Contact',
          shortDesc: 'Triggered when a new contact is created in Outlook.',
          longDesc:
            'This trigger is activated whenever a new contact is added to your Microsoft Outlook contacts.',
        },
        'new-email': {
          displayName: 'New Email Trigger',
          shortDesc: 'Triggers when a new email is received in your Outlook inbox',
          longDesc:
            'Monitors your Outlook inbox and triggers when new emails arrive. Supports filtering by sender, subject, or attachments, and can optionally delete or move processed emails.',
          options: {
            senderFilter: {
              displayName: 'Sender Filter',
              shortDesc: 'Filter emails by sender address',
              longDesc:
                'Only trigger for emails from this specific sender email address. Leave empty to trigger for all senders.',
            },
            subjectFilter: {
              displayName: 'Subject Filter',
              shortDesc: 'Filter emails by subject content',
              longDesc:
                'Only trigger for emails containing this text in the subject line. Leave empty to match any subject.',
            },
            hasAttachments: {
              displayName: 'Has Attachments',
              shortDesc: 'Filter by attachment presence',
              longDesc:
                'Filter emails based on whether they have attachments. Set to true to only trigger for emails with attachments, false for emails without attachments, or leave empty to trigger for both.',
            },
            includeAttachmentData: {
              displayName: 'Include Attachment Data',
              shortDesc: 'Include attachment content in trigger data',
              longDesc:
                'When enabled, the trigger will fetch and include the actual attachment content in the trigger data. This may increase processing time for large attachments.',
            },
            action: {
              displayName: 'Email Action',
              shortDesc: 'Action to perform after triggering',
              longDesc:
                'Optional action to perform on emails after the trigger runs. Choose "None" to leave emails unchanged, "Delete" to remove the email, or "Move" to relocate the email to another folder.',
            },
            targetFolderId: {
              displayName: 'Target Folder',
              shortDesc: 'Destination folder for moved emails',
              longDesc:
                'The folder where emails will be moved if the "Move" action is selected. Only required when action is set to "Move".',
            },
          },
          event_info: {
            desc: 'Data from the received email, including metadata and content',
          },
        },
        'new-event': {
          displayName: 'New Event',
          shortDesc: 'Triggered when a new event is created in an Outlook calendar.',
          longDesc:
            'This trigger is activated whenever a new event or meeting is created in your Microsoft Outlook calendar.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar to monitor for new events.',
              longDesc:
                'Optionally select a specific calendar to monitor. If not specified, all calendars will be monitored.',
            },
          },
        },
      },
    },
    Teams: {
      displayName: 'Microsoft Teams',
      shortDesc: 'Collaborate with your team using channels, meetings, and messages',
      longDesc:
        'Microsoft Teams is a collaboration platform that enables messaging, file sharing, video meetings, and app integration within your organization.',
      actions: {
        'create-channel': {
          displayName: 'Create Channel',
          shortDesc: 'Create a new channel in a team',
          longDesc:
            'Create a new channel within a specified team where members can collaborate through conversations, files, and integrated apps.',
          options: {
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Unique identifier for the team',
              longDesc:
                'The unique identifier (GUID) for the team where the new channel will be created.',
            },
            displayName: {
              displayName: 'Channel Name',
              shortDesc: 'Name of the new channel',
              longDesc:
                'The display name for the new channel. Must be unique within the team and between 1-50 characters.',
            },
            description: {
              displayName: 'Description',
              shortDesc: 'Description of the channel purpose',
              longDesc:
                'Optional description explaining the purpose or topic of the channel. Limited to 1024 characters.',
            },
            membershipType: {
              displayName: 'Membership Type',
              shortDesc: 'Channel privacy setting',
              longDesc:
                'Defines the privacy level of the channel. Options include "standard" (visible to all team members) or "private" (visible only to specific members).',
            },
          },
        },
        'create-meeting': {
          displayName: 'Create Meeting',
          shortDesc: 'Schedule a new Teams meeting',
          longDesc:
            'Schedule a new meeting in Microsoft Teams with specified participants, time, location, and other meeting details.',
          options: {
            subject: {
              displayName: 'Subject',
              shortDesc: 'Meeting title',
              longDesc:
                'The title or subject of the meeting that will appear in calendar invitations and the meeting list.',
            },
            startDateTime: {
              displayName: 'Start Time',
              shortDesc: 'Meeting start date and time',
              longDesc:
                'The date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            endDateTime: {
              displayName: 'End Time',
              shortDesc: 'Meeting end date and time',
              longDesc:
                'The date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Optional team identifier if the meeting is associated with a specific team.',
            },
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Associated channel identifier',
              longDesc:
                'Optional channel identifier if the meeting is associated with a specific channel within a team.',
            },
            content: {
              displayName: 'Meeting Content',
              shortDesc: 'Meeting agenda or notes',
              longDesc:
                'Optional text describing the meeting agenda, preparation materials, or other relevant information.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Physical or virtual meeting location',
              longDesc:
                'The physical location where the meeting will take place, or a custom virtual location description.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'Meeting participants',
              longDesc:
                'List of email addresses or user IDs for people who should be invited to the meeting.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Enable Teams online meeting features',
              longDesc:
                'When set to true, creates a Teams online meeting with video conferencing capabilities and a join link.',
            },
            timeZone: {
              displayName: 'Time Zone',
              shortDesc: 'Meeting time zone',
              longDesc:
                'The time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
            },
          },
        },
        'delete-meeting': {
          displayName: 'Delete Meeting',
          shortDesc: 'Cancel an existing meeting',
          longDesc:
            "Permanently cancels and removes a scheduled meeting from all participants' calendars.",
          options: {
            meetingId: {
              displayName: 'Meeting ID',
              shortDesc: 'Unique meeting identifier',
              longDesc: 'The unique identifier (GUID) of the meeting to be canceled.',
            },
            meetingSource: {
              displayName: 'Meeting Source',
              shortDesc: 'Origin of the meeting',
              longDesc: 'Specifies where the meeting was created, such as "private" or "team".',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc: 'The team identifier if the meeting is associated with a specific team.',
            },
          },
        },
        'send-channel-message': {
          displayName: 'Send Channel Message',
          shortDesc: 'Post a message to a team channel',
          longDesc:
            'Send a new message to a specific channel within a team that all channel members can view and respond to.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Target channel identifier',
              longDesc: 'The unique identifier of the channel where the message will be posted.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the target channel.',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message content',
              longDesc: 'The text content of the message to be posted in the channel.',
            },
            contentType: {
              displayName: 'Content Type',
              shortDesc: 'Format of the message content',
              longDesc:
                'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
            },
          },
        },
        'send-chat-message': {
          displayName: 'Send Chat Message',
          shortDesc: 'Send a message to a chat conversation',
          longDesc:
            'Send a new message to a direct chat or group chat conversation outside of a team channel.',
          options: {
            chatId: {
              displayName: 'Chat ID',
              shortDesc: 'Target chat identifier',
              longDesc:
                'The unique identifier of the direct chat or group chat where the message will be sent.',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message content',
              longDesc: 'The text content of the message to be sent in the chat.',
            },
            contentType: {
              displayName: 'Content Type',
              shortDesc: 'Format of the message content',
              longDesc:
                'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
            },
          },
        },
        'update-channel': {
          displayName: 'Update Channel',
          shortDesc: 'Modify an existing channel',
          longDesc: 'Update the properties or membership of an existing channel within a team.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Target channel identifier',
              longDesc: 'The unique identifier of the channel to be updated.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the channel to be updated.',
            },
            displayName: {
              displayName: 'Channel Name',
              shortDesc: 'New channel name',
              longDesc:
                'The new display name for the channel. Must be unique within the team and between 1-50 characters.',
            },
            description: {
              displayName: 'Description',
              shortDesc: 'New channel description',
              longDesc:
                'Updated description explaining the purpose or topic of the channel. Limited to 1024 characters.',
            },
            addMembers: {
              displayName: 'Add Members',
              shortDesc: 'Users to add to the channel',
              longDesc:
                'List of user IDs to add as members to the channel. Only applicable for private channels.',
            },
            removeMembers: {
              displayName: 'Remove Members',
              shortDesc: 'Users to remove from the channel',
              longDesc:
                'List of user IDs to remove from the channel membership. Only applicable for private channels.',
            },
          },
        },
        'update-meeting': {
          displayName: 'Update Meeting',
          shortDesc: 'Modify an existing meeting',
          longDesc:
            'Update the details of a scheduled meeting, such as time, location, attendees, or other properties.',
          options: {
            meetingId: {
              displayName: 'Meeting ID',
              shortDesc: 'Target meeting identifier',
              longDesc: 'The unique identifier of the meeting to be updated.',
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'Updated meeting title',
              longDesc:
                'The new title or subject of the meeting that will appear in calendar invitations and the meeting list.',
            },
            startDateTime: {
              displayName: 'Start Time',
              shortDesc: 'Updated meeting start time',
              longDesc:
                'The new date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            endDateTime: {
              displayName: 'End Time',
              shortDesc: 'Updated meeting end time',
              longDesc:
                'The new date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Updated team identifier if the meeting is associated with a specific team.',
            },
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Associated channel identifier',
              longDesc:
                'Updated channel identifier if the meeting is associated with a specific channel within a team.',
            },
            content: {
              displayName: 'Meeting Content',
              shortDesc: 'Updated meeting agenda or notes',
              longDesc:
                'Updated text describing the meeting agenda, preparation materials, or other relevant information.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Updated meeting location',
              longDesc:
                'The new physical location where the meeting will take place, or a custom virtual location description.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'Updated meeting participants',
              longDesc:
                'Updated list of email addresses or user IDs for people who should be invited to the meeting.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Enable/disable Teams online meeting features',
              longDesc:
                'When set to true, ensures the meeting has Teams online meeting capabilities with video conferencing and a join link.',
            },
            timeZone: {
              displayName: 'Time Zone',
              shortDesc: 'Updated meeting time zone',
              longDesc:
                'The new time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
            },
          },
        },
      },
      triggers: {
        'new-channel-message': {
          displayName: 'New Channel Message',
          shortDesc: 'Trigger when a message is posted in a channel',
          longDesc:
            'This trigger fires when a new message is posted in a specified channel within a team.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Channel to monitor for messages',
              longDesc: 'The unique identifier of the channel to monitor for new messages.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the channel to monitor.',
            },
          },
        },
        'new-chat-message': {
          displayName: 'New Chat Message',
          shortDesc: 'Trigger when a message is sent in a chat',
          longDesc:
            'This trigger fires when a new message is sent in a direct chat or group chat conversation.',
          options: {
            chatId: {
              displayName: 'Chat ID',
              shortDesc: 'Chat to monitor for messages',
              longDesc:
                'The unique identifier of the direct chat or group chat to monitor for new messages.',
            },
          },
        },
        'new-meeting': {
          displayName: 'New Meeting',
          shortDesc: 'Trigger when a meeting is created',
          longDesc:
            'This trigger fires when a new meeting is scheduled that matches the specified criteria.',
          options: {
            meetingSource: {
              displayName: 'Meeting Source',
              shortDesc: 'Origin of the meeting',
              longDesc:
                'Specifies which type of meetings to monitor, such as "private" or "team" meetings.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Optional filter to only trigger for meetings associated with a specific team.',
            },
          },
        },
      },
    },
    Serenity: {
      displayName: 'Serenity',
      shortDesc:
        'Create conversations, execute agents and manage interactions with Serenity AI Hub.',
      longDesc:
        'Enterprise AI ecosystem that enables businesses to create, manage, and scale AI agents effortlessly, enhancing productivity and innovation across various processes.',
      actions: {
        'create-conversation': {
          displayName: 'Create Conversation',
          shortDesc: 'Create a conversation with a conversation agent',
          longDesc:
            'Creates a conversation with the given agent code. This is required before executing an agent.',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc: 'The code of the agent to create a conversation with',
              longDesc: 'The code of the agent to create a conversation with',
            },
            userIdentifier: {
              displayName: 'User Identifier',
              shortDesc: 'Used to uniquely identify a user in a conversation. ',
              longDesc:
                'It helps maintain context across interactions. For example, you might use `"userIdentifier": "landing-page-user"` to track a specific user session.',
            },
            inputParameters: {
              displayName: 'Input Parameters',
              shortDesc: 'An array of key-value pairs for additional context.',
              longDesc: 'An array of key-value pairs for additional context.',
              type: {
                fields: {
                  key: {
                    displayName: 'Key',
                    shortDesc: 'The key of the parameter',
                    longDesc: 'The key of the parameter',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'The value of the parameter',
                    longDesc: 'The value of the parameter',
                  },
                },
              },
            },
          },
        },
        'execute-agent': {
          displayName: 'Execute Agent',
          shortDesc: 'Executes an agent with the given code.',
          longDesc: 'Executes an agent with the given code.',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc:
                'Used to identify and execute a specific agent within the Serenity* AI Hub',
              longDesc: 'Used to identify and execute a specific agent within the Serenity* AI Hub',
            },
            culture: {
              displayName: 'Culture',
              shortDesc: 'Use this param to override the culture of the response.',
              longDesc: 'Use this param to override the culture of the response.',
            },
            userLanguage: {
              displayName: 'User Language',
              shortDesc: 'The preferred language of the response',
              longDesc: 'The preferred language of the response',
            },
            params: {
              displayName: 'Params',
              shortDesc: 'An array of key-value pairs for execution context.',
              longDesc: 'An array of key-value pairs for execution context.',
              type: {
                fields: {
                  key: {
                    displayName: 'Key',
                    shortDesc: 'The key of the parameter',
                    longDesc: 'The key of the parameter',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'The value of the parameter',
                    longDesc: 'The value of the parameter',
                  },
                },
              },
            },
            volatileKnowledgeIds: {
              displayName: 'Volatile Knowledge IDs',
              shortDesc:
                'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
              longDesc:
                'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
            },
          },
        },
        'execute-conversation': {
          displayName: 'Execute Conversation',
          shortDesc: 'Send a message to a chat with agent',
          longDesc: 'Send a message to a chat with agent',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc: 'The agent to check for conversations with',
              longDesc: 'The agent to check for conversations with',
            },
            conversationId: {
              displayName: 'Conversation ID',
              shortDesc: 'The conversation to send the message to',
              longDesc: 'The conversation to send the message to',
            },
            userLanguage: {
              displayName: 'User Language',
              shortDesc: 'The preferred language of the response',
              longDesc: 'The preferred language of the response',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message to send to the agent',
              longDesc: 'Message to send to the agent',
            },
            culture: {
              displayName: 'Culture',
              shortDesc: 'Use this param to override the culture of the response.',
              longDesc: 'Use this param to override the culture of the response. ',
            },
          },
        },
      },
      triggers: {
        'new-conversation-message': {
          displayName: 'New Conversation Message',
          shortDesc: 'Triggered when a new message is posted in a conversation.',
          longDesc: 'This trigger activates when a new message is posted in a conversation.',
          options: {
            conversationId: {
              displayName: 'Conversation ID',
              shortDesc: 'The unique identifier for the conversation.',
              longDesc:
                'Enter the Conversation ID to specify the conversation where you want to monitor new messages.',
            },
            agentCode: {
              displayName: 'Agent ID',
              shortDesc: 'The unique identifier for the agent.',
              longDesc: 'Agent ID to check for available conversations from',
            },
            sender: {
              displayName: 'Sender',
              shortDesc: 'Filter the messages by the sender.',
              longDesc: 'Choose the sender the messages should be filtered by.',
            },
          },
        },
      },
    },
    Pipedrive: {
      displayName: 'Pipedrive',
      shortDesc: 'Manage your sales pipeline and customer relationships with Pipedrive.',
      longDesc:
        'Pipedrive is a sales management tool designed to help small sales teams manage intricate or lengthy sales processes.',
      triggers: {
        pipedrive_activity_trigger: {
          displayName: 'Activity Action',
          shortDesc: 'Triggers when an action is performed on an activity',
          longDesc:
            'This trigger activates when a selected action is performed on an activity in Pipedrive. Actions include creating, updating, deleting an activity or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_deal_trigger: {
          displayName: 'Deal Action',
          shortDesc: 'Triggers when an action is performed on a deal',
          longDesc:
            'This trigger activates when a selected action is performed on a deal in Pipedrive. Actions include creating, updating, deleting a deal or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_lead_trigger: {
          displayName: 'Lead Action',
          shortDesc: 'Triggers when an action is performed on a lead',
          longDesc:
            'This trigger activates when a selected action is performed on a lead in Pipedrive. Actions include creating, updating, deleting a lead or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_note_trigger: {
          displayName: 'Note Action',
          shortDesc: 'Triggers when an action is performed on a note',
          longDesc:
            'This trigger activates when a selected action is performed on a note in Pipedrive. Actions include creating, updating, deleting a note or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_organization_trigger: {
          displayName: 'Organization Action',
          shortDesc: 'Triggers when an action is performed on an organization',
          longDesc:
            'This trigger activates when a selected action is performed on an organization in Pipedrive. Actions include creating, updating, deleting an organization or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_person_trigger: {
          displayName: 'Person Action',
          shortDesc: 'Triggers when an action is performed on a person',
          longDesc:
            'This trigger activates when a selected action is performed on a person in Pipedrive. Actions include creating, updating, deleting a person or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_user_trigger: {
          displayName: 'User Action',
          shortDesc: 'Triggers when an action is performed on a user',
          longDesc:
            'This trigger activates when a selected action is performed on a user in Pipedrive. Actions include creating, updating, deleting a user or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
      },
    },
    Magento: {
      displayName: 'Magento',
      shortDesc:
        'E-commerce platform for building online stores and managing customers, products, and orders',
      longDesc:
        'Magento is a flexible e-commerce platform that provides businesses with a complete solution for building and managing online stores. This integration allows you to automate workflows when customer, product, order, invoice, or shipment events occur in your Magento store.',
      actions: {
        customerCustomerRepositoryV1GetByIdGet: {
          displayName: 'Get Customer by ID',
          shortDesc: 'Retrieve a specific customer account by ID',
          longDesc:
            'Retrieves detailed information about a customer account using the customer ID. Returns all customer attributes including address information, account status, and custom attributes.',
        },
        customerCustomerRepositoryV1SavePut: {
          displayName: 'Update Customer',
          shortDesc: 'Update an existing customer account',
          longDesc:
            'Updates customer information for an existing account. This endpoint allows modification of personal information, addresses, custom attributes, and other account details. The customer ID must be included in the request.',
        },
        customerCustomerRepositoryV1DeleteByIdDelete: {
          displayName: 'Delete Customer',
          shortDesc: 'Remove a customer account by ID',
          longDesc:
            'Permanently deletes a customer account from the system. This operation cannot be undone and will remove all customer data associated with the specified ID, including addresses and order history references.',
        },
        customerCustomerRepositoryV1GetListGet: {
          displayName: 'List Customers',
          shortDesc: 'Retrieve a list of customer accounts',
          longDesc:
            'Returns a list of customer accounts that match specified search criteria. Results can be filtered, sorted, and paginated. Use search criteria parameters to narrow results by email, name, creation date, or other customer attributes.',
          options: MagentoSearchOptionsEn,
        },
        customerAccountManagementV1CreateAccountPost: {
          displayName: 'Create Customer Account',
          shortDesc: 'Register a new customer account',
          longDesc:
            'Creates a new customer account with the provided information. Required fields include email, password, and first/last name. Optional details include addresses, date of birth, and custom attributes. Returns the newly created customer ID upon success.',
        },
        catalogProductRepositoryV1SavePost: {
          displayName: 'Create Product',
          shortDesc: 'Add a new product to the catalog',
          longDesc:
            'Creates a new product in the catalog with specified attributes, pricing, and inventory information. Products can be simple, configurable, bundled, grouped, virtual, or downloadable. Media gallery entries, tier prices, and custom options can also be defined.',
        },
        catalogProductRepositoryV1GetListGet: {
          displayName: 'List Products',
          shortDesc: 'Retrieve a list of products from the catalog',
          longDesc:
            'Returns a collection of products that match the specified search criteria. Results can be filtered by attributes like name, SKU, price, and status. Supports pagination, sorting, and inclusion of custom attributes in the response.',
          options: MagentoSearchOptionsEn,
        },
        catalogProductRepositoryV1SavePut: {
          displayName: 'Update Product',
          shortDesc: 'Modify an existing product',
          longDesc:
            'Updates an existing product in the catalog. Can modify any product attribute including name, price, description, images, inventory, and category assignments. The product SKU or ID must be specified in the request.',
          options: {
            sku: {
              displayName: 'Product SKU',
              shortDesc: 'Stock Keeping Unit identifier for the product',
              longDesc:
                'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
            },
          },
        },
        catalogProductRepositoryV1DeleteByIdDelete: {
          displayName: 'Delete Product',
          shortDesc: 'Remove a product from the catalog',
          longDesc:
            'Permanently removes a product from the catalog by ID or SKU. This operation cannot be undone and may affect existing orders and carts that reference the deleted product.',
          options: {
            sku: {
              displayName: 'Product SKU',
              shortDesc: 'Stock Keeping Unit identifier for the product',
              longDesc:
                'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
            },
          },
        },
        catalogProductRepositoryV1GetGet: {
          displayName: 'Get Product Details',
          shortDesc: 'Retrieve detailed information about a specific product',
          longDesc:
            'Retrieves comprehensive information about a specific product by SKU or ID. The response includes all product attributes, images, pricing information, inventory status, and category assignments. Additional parameters can control which data is included.',
          options: {
            sku: {
              displayName: 'Product SKU',
              shortDesc: 'Stock Keeping Unit identifier for the product',
              longDesc:
                'A unique alphanumeric identifier assigned to a product for inventory tracking and management purposes. The SKU helps in identifying specific product variations including size, color, and other attributes.',
            },
          },
        },
        quoteCartRepositoryV1GetListGet: {
          displayName: 'List Shopping Carts',
          shortDesc: 'Retrieve a list of active shopping carts',
          longDesc:
            'Returns a collection of active shopping carts that match the specified search criteria. Results can be filtered by customer ID, creation date, and cart status. Each cart includes items, applied coupons, and shipping/billing information if available.',
          options: MagentoSearchOptionsEn,
        },
        salesOrderRepositoryV1GetGet: {
          displayName: 'Get Order Details',
          shortDesc: 'Retrieve detailed information about a specific order',
          longDesc:
            'Retrieves comprehensive information about a specific order by ID. Includes order items, billing and shipping addresses, payment information, applied discounts, and order status history. Useful for order processing and customer service inquiries.',
        },
        salesOrderRepositoryV1GetListGet: {
          displayName: 'List Orders',
          shortDesc: 'Retrieve a list of orders based on search criteria',
          longDesc:
            'Returns a collection of orders that match the specified search criteria. Results can be filtered by customer, status, date range, and total amount. Supports pagination and sorting to efficiently browse large order volumes.',
          options: MagentoSearchOptionsEn,
        },
        salesShipmentRepositoryV1SavePost: {
          displayName: 'Create Shipment',
          shortDesc: 'Creates a new shipment for an order',
          longDesc:
            'Creates a new shipment record for an existing order, allowing you to document and track the physical sending of order items to the customer. Includes options for specifying tracking numbers, shipping carriers, and shipped items with their quantities.',
        },
        salesInvoiceRepositoryV1SavePost: {
          displayName: 'Create Invoice',
          shortDesc: 'Creates a new invoice for an order',
          longDesc:
            "Creates a new invoice record for an existing order, documenting the financial transaction and payment request. Allows for specifying line items to be invoiced, payment details, and comments that will appear on the customer's invoice.",
        },
        salesOrderRepositoryV1SavePut: {
          displayName: 'Create Order',
          shortDesc: 'Persists order information to the system',
          longDesc:
            'Performs persist operations for a specified order. Saves the order data to the database, including customer information, line items, payment details, shipping information, and other relevant order metadata.',
        },
        salesOrderManagementV1AddCommentPost: {
          displayName: 'Add Order Comment',
          shortDesc: 'Append a comment to an existing order',
          longDesc:
            'Adds a comment to the order history. Comments can be internal (visible only to administrators) or customer-visible. Each comment is timestamped and attributed to the author. Useful for documenting order processing steps and customer communications.',
          options: {
            id: {
              displayName: 'Order ID',
              shortDesc: 'The ID of the order to which the comment will be added',
              longDesc: 'The ID of the order to which the comment will be added',
            },
          },
        },
        salesOrderManagementV1GetCommentsListGet: {
          displayName: 'Get Order Comments',
          shortDesc: 'Retrieve the comment history for an order',
          longDesc:
            'Returns the complete comment history for a specific order. Results include comment text, timestamp, author information, and visibility status (customer-visible or admin-only). Comments are returned in chronological order.',
        },
        salesInvoiceRepositoryV1GetListGet: {
          displayName: 'List Invoices',
          shortDesc: 'Retrieve a collection of invoices',
          longDesc:
            'Returns a list of invoices based on specified search criteria. Results can be filtered by order ID, customer, date, and amount. Each invoice includes line items, payment information, and related order details. Supports pagination and sorting.',
          options: MagentoSearchOptionsEn,
        },
        salesShipmentRepositoryV1GetListGet: {
          displayName: 'List Shipments',
          shortDesc: 'Retrieve a collection of order shipments',
          longDesc:
            'Returns a list of shipments based on specified search criteria. Results can be filtered by order ID, customer, creation date, and tracking information. Each shipment includes items shipped, quantities, tracking numbers, and carrier information.',
          options: MagentoSearchOptionsEn,
        },
        salesTransactionRepositoryV1GetListGet: {
          displayName: 'List Payment Transactions',
          shortDesc: 'Retrieve a collection of payment transactions',
          longDesc:
            'Returns a list of payment transactions based on specified search criteria. Results can be filtered by order ID, payment method, transaction type, and status. Each transaction includes amount, status, and related payment gateway information.',
          options: MagentoSearchOptionsEn,
        },
        rmaRmaRepositoryV1DeleteDelete: {
          displayName: 'Delete Return Request',
          shortDesc: 'Remove a Return Merchandise Authorization (RMA)',
          longDesc:
            'Permanently deletes a Return Merchandise Authorization (RMA) request from the system. This operation cannot be undone and removes all associated return information including submitted items, reason codes, and processing history.',
        },
        rmaRmaManagementV1SaveRmaPost: {
          displayName: 'Create Return Request',
          shortDesc: 'Submit a new Return Merchandise Authorization (RMA)',
          longDesc:
            'Creates a new Return Merchandise Authorization (RMA) request for an existing order. The request includes items to be returned, quantities, reason codes, and customer comments. Additional documentation such as images can be attached to support the return request.',
        },
        rmaRmaManagementV1SearchGet: {
          displayName: 'Search Return Requests',
          shortDesc: 'Find Return Merchandise Authorizations (RMAs)',
          longDesc:
            'Searches for Return Merchandise Authorization (RMA) requests based on specified criteria. Results can be filtered by order ID, customer, status, and date range. Each RMA includes return items, processing status, and communication history.',
        },
      },
      triggers: {
        'customer-created-or-updated': {
          displayName: 'Customer Created or Updated',
          shortDesc: 'Triggers when a customer is created or updated in Magento',
          longDesc:
            "This trigger activates when a new customer is created in your Magento store or when an existing customer's information is updated.",
          options: {
            activationCriteria: {
              displayName: 'Activation Criteria',
              shortDesc: 'Specify when this trigger should activate',
              longDesc:
                'Select whether this trigger should activate on customer creation or on customer updates.',
            },
          },
        },
        'invoice-created-or-updated': {
          displayName: 'Invoice Created or Updated',
          shortDesc: 'Triggers when an invoice is created or updated in Magento',
          longDesc:
            'This trigger activates when a new invoice is generated in your Magento store or when an existing invoice is modified.',
          options: {
            activationCriteria: {
              displayName: 'Activation Criteria',
              shortDesc: 'Specify when this trigger should activate',
              longDesc:
                'Select whether this trigger should activate on invoice creation or on invoice updates.',
            },
          },
        },
        'product-created-or-updated': {
          displayName: 'Product Created or Updated',
          shortDesc: 'Triggers when a product is created or updated in Magento',
          longDesc:
            "This trigger activates when a new product is added to your Magento catalog or when an existing product's information is modified.",
          options: {
            activationCriteria: {
              displayName: 'Activation Criteria',
              shortDesc: 'Specify when this trigger should activate',
              longDesc:
                'Select whether this trigger should activate on product creation or on product updates.',
            },
          },
        },
        'order-created': {
          displayName: 'Order Created',
          shortDesc: 'Triggers when a new order is placed in Magento',
          longDesc:
            'This trigger activates when a customer completes the checkout process and places a new order in your Magento store.',
        },
        'shipment-created': {
          displayName: 'Shipment Created',
          shortDesc: 'Triggers when a new shipment is created in Magento',
          longDesc:
            'This trigger activates when a new shipment is created for an order in your Magento store, indicating that products have been shipped to the customer.',
        },
      },
    },
    Shopify: {
      displayName: 'Shopify',
      shortDesc: 'E-commerce platform for online stores and retail point of sale',
      longDesc:
        'Shopify is a comprehensive commerce platform that allows businesses to start, grow, and manage an online store, sell in multiple places, and synchronize online and in-person sales.',
      actions: {
        'find-product': {
          displayName: 'Find Products',
          shortDesc: 'Search for products in your store',
          longDesc:
            'Search and filter products in your Shopify store based on various criteria including title, vendor, product type, and more.',
          options: {
            titleQuery: {
              displayName: 'Title',
              shortDesc: 'Search by product title',
              longDesc:
                'Filter products by matching text in their titles. Supports partial matches.',
            },
            vendorQuery: {
              displayName: 'Vendor',
              shortDesc: 'Filter by product vendor',
              longDesc: 'Find products from specific vendors or suppliers in your store.',
            },
            productTypeQuery: {
              displayName: 'Product Type',
              shortDesc: 'Filter by product type',
              longDesc: 'Search for products based on their assigned product type category.',
            },
            tagQuery: {
              displayName: 'Tags',
              shortDesc: 'Search by product tags',
              longDesc: 'Find products that have been tagged with specific keywords or labels.',
            },
            skuQuery: {
              displayName: 'SKU',
              shortDesc: 'Search by product SKU',
              longDesc: 'Look up products using their Stock Keeping Unit (SKU) identifier.',
            },
            barcodeQuery: {
              displayName: 'Barcode',
              shortDesc: 'Search by barcode',
              longDesc: 'Find products using their UPC, ISBN, or other barcode identifiers.',
            },
            productIdQuery: {
              displayName: 'Product ID',
              shortDesc: 'Search by product ID',
              longDesc: 'Look up a specific product using its unique Shopify product ID.',
            },
            collectionIdQuery: {
              displayName: 'Collection',
              shortDesc: 'Filter by collection ID',
              longDesc: 'Find products that belong to a specific collection in your store.',
            },
            sortKey: {
              displayName: 'Sort By',
              shortDesc: 'Sort the results',
              longDesc: 'Choose how to order the results (e.g., by title, price, created date).',
            },
            reverse: {
              displayName: 'Reverse Order',
              shortDesc: 'Reverse the sort order',
              longDesc: 'Toggle between ascending and descending sort order for the results.',
            },
            rawQuery: {
              displayName: 'Advanced Query',
              shortDesc: 'Use custom search syntax',
              longDesc:
                'Enter a custom search query for advanced filtering using Shopify search syntax.',
            },
            limit: {
              displayName: 'Results Limit',
              shortDesc: 'Maximum number of results',
              longDesc: 'Specify the maximum number of products to return in the search results.',
            },
            cursor: {
              displayName: 'Pagination Cursor',
              shortDesc: 'Navigate through pages of results',
              longDesc: 'Use a cursor to paginate through large sets of search results.',
            },
          },
        },
        'find-order': {
          displayName: 'Find Orders',
          shortDesc: 'Search for customer orders',
          longDesc:
            'Search and filter orders in your Shopify store based on various criteria including customer name, email, order number, and more.',
          options: {
            name: {
              displayName: 'Order Number',
              shortDesc: 'Search by order number',
              longDesc: 'Look up orders using their confirmation or order number.',
            },
            email: {
              displayName: 'Email',
              shortDesc: 'Search by customer email',
              longDesc: 'Find orders associated with a specific customer email address.',
            },
            customer_id: {
              displayName: 'Customer ID',
              shortDesc: 'Filter by customer ID',
              longDesc:
                'Find all orders placed by a specific customer using their Shopify customer ID.',
            },
            confirmation_number: {
              displayName: 'Confirmation Number',
              shortDesc: 'Search by confirmation number',
              longDesc: 'Find orders by their unique confirmation number provided to customers.',
            },
            id: {
              displayName: 'Order ID',
              shortDesc: 'Search by order ID',
              longDesc: 'Look up a specific order using its unique Shopify order ID.',
            },
            financial_status: {
              displayName: 'Payment Status',
              shortDesc: 'Filter by payment status',
              longDesc:
                'Find orders with a specific payment status (paid, pending, refunded, etc.).',
            },
            fulfillment_status: {
              displayName: 'Fulfillment Status',
              shortDesc: 'Filter by shipping status',
              longDesc:
                'Find orders with a specific fulfillment status (fulfilled, unfulfilled, shipped, etc.).',
            },
            status: {
              displayName: 'Order Status',
              shortDesc: 'Filter by order status',
              longDesc: 'Find orders based on their overall status (open, closed, cancelled).',
            },
            source_name: {
              displayName: 'Source',
              shortDesc: 'Filter by order source',
              longDesc: 'Find orders from specific sources (e.g., web, draft orders, POS).',
            },
            sales_channel: {
              displayName: 'Sales Channel',
              shortDesc: 'Filter by sales channel',
              longDesc:
                'Find orders from specific sales channels configured in your Shopify store.',
            },
            sku: {
              displayName: 'Product SKU',
              shortDesc: 'Search by product SKU',
              longDesc: 'Find orders containing products with a specific SKU.',
            },
            created_at: {
              displayName: 'Created Date',
              shortDesc: 'Filter by creation date',
              longDesc:
                'Find orders created on a specific date or within a date range (e.g., 2021-01-01, <now, <=2024).',
            },
            updated_at: {
              displayName: 'Updated Date',
              shortDesc: 'Filter by last update date',
              longDesc: 'Find orders last updated on a specific date or within a date range.',
            },
            processed_at: {
              displayName: 'Processed Date',
              shortDesc: 'Filter by processed date',
              longDesc: 'Find orders processed on a specific date or within a date range.',
            },
            tag: {
              displayName: 'Tag',
              shortDesc: 'Filter by order tag',
              longDesc: 'Find orders that have been tagged with specific labels in Shopify.',
            },
            test: {
              displayName: 'Test Orders',
              shortDesc: 'Include/exclude test orders',
              longDesc: 'Filter to show only test orders (true) or exclude test orders (false).',
            },
            location_id: {
              displayName: 'Location',
              shortDesc: 'Filter by store location',
              longDesc:
                'Find orders associated with a specific store location or fulfillment center.',
            },
            po_number: {
              displayName: 'Purchase Order Number',
              shortDesc: 'Search by PO number',
              longDesc: 'Find orders associated with a specific purchase order number.',
            },
            rawQuery: {
              displayName: 'Advanced Query',
              shortDesc: 'Use custom search syntax',
              longDesc:
                'Enter a custom search query for advanced filtering using Shopify search syntax.',
            },
            sortKey: {
              displayName: 'Sort By',
              shortDesc: 'Sort the results',
              longDesc:
                'Choose how to order the results (e.g., by date, order number, total value).',
            },
            reverse: {
              displayName: 'Reverse Order',
              shortDesc: 'Reverse the sort order',
              longDesc: 'Toggle between ascending and descending sort order for the results.',
            },
            limit: {
              displayName: 'Results Limit',
              shortDesc: 'Maximum number of results',
              longDesc:
                'Specify the maximum number of orders to return in the search results (max: 250).',
            },
            cursor: {
              displayName: 'Pagination Cursor',
              shortDesc: 'Navigate through pages of results',
              longDesc: 'Use a cursor to paginate through large sets of search results.',
            },
          },
        },
        'find-customer': {
          displayName: 'Find Customers',
          shortDesc: 'Search for customers',
          longDesc:
            'Search and filter customers in your Shopify store based on names, emails, or other attributes.',
          options: {
            query: {
              displayName: 'Search Query',
              shortDesc: 'Search by name or email',
              longDesc:
                'Search for customers by their name, email, or other identifying information.',
            },
            limit: {
              displayName: 'Results Limit',
              shortDesc: 'Maximum number of results',
              longDesc: 'Specify the maximum number of customers to return in the search results.',
            },
            cursor: {
              displayName: 'Pagination Cursor',
              shortDesc: 'Navigate through pages of results',
              longDesc: 'Use a cursor to paginate through large sets of search results.',
            },
            sortKey: {
              displayName: 'Sort By',
              shortDesc: 'Sort the results',
              longDesc:
                'Choose how to order the results (e.g., by name, date created, total spent).',
            },
            reverse: {
              displayName: 'Reverse Order',
              shortDesc: 'Reverse the sort order',
              longDesc: 'Toggle between ascending and descending sort order for the results.',
            },
          },
        },
        'find-variant': {
          displayName: 'Find Product Variants',
          shortDesc: 'Search for specific product variants',
          longDesc:
            'Search and filter product variants in your Shopify store based on criteria like SKU, barcode, price, or inventory status.',
          options: {
            productId: {
              displayName: 'Product ID',
              shortDesc: 'Filter by parent product',
              longDesc:
                'Find variants that belong to a specific parent product using its Shopify product ID.',
            },
            title: {
              displayName: 'Variant Title',
              shortDesc: 'Search by variant title',
              longDesc: 'Filter variants by matching text in their titles or option values.',
            },
            sku: {
              displayName: 'SKU',
              shortDesc: 'Search by variant SKU',
              longDesc: 'Look up variants using their Stock Keeping Unit (SKU) identifier.',
            },
            barcode: {
              displayName: 'Barcode',
              shortDesc: 'Search by barcode',
              longDesc: 'Find variants using their UPC, ISBN, or other barcode identifiers.',
            },
            id: {
              displayName: 'Variant ID',
              shortDesc: 'Search by variant ID',
              longDesc: 'Look up a specific variant using its unique Shopify variant ID.',
            },
            inventoryQuantity: {
              displayName: 'Inventory Quantity',
              shortDesc: 'Filter by inventory quantity',
              longDesc:
                'Find variants based on their exact inventory quantity or range (e.g., "inventory_quantity:10" or "inventory_quantity:>5").',
            },
            productStatus: {
              displayName: 'Product Status',
              shortDesc: 'Filter by product status',
              longDesc:
                'Find variants based on whether their parent product is active, draft, or archived.',
            },
            productType: {
              displayName: 'Product Type',
              shortDesc: 'Filter by product type',
              longDesc: 'Find variants belonging to products of a specific type or category.',
            },
            tag: {
              displayName: 'Product Tag',
              shortDesc: 'Filter by product tag',
              longDesc: 'Find variants belonging to products that have a specific tag.',
            },
            tagNot: {
              displayName: 'Exclude Tag',
              shortDesc: 'Filter out products with tag',
              longDesc: 'Find variants belonging to products that do not have a specific tag.',
            },
            vendor: {
              displayName: 'Vendor',
              shortDesc: 'Filter by vendor or supplier',
              longDesc: 'Find variants belonging to products from a specific vendor or supplier.',
            },
            collection: {
              displayName: 'Collection',
              shortDesc: 'Filter by collection',
              longDesc:
                'Find variants belonging to products in a specific collection using the collection ID.',
            },
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Filter by first option',
              longDesc:
                'Find variants with a specific value for their first option (e.g., Size, Color).',
            },
            option2: {
              displayName: 'Option 2',
              shortDesc: 'Filter by second option',
              longDesc: 'Find variants with a specific value for their second option.',
            },
            option3: {
              displayName: 'Option 3',
              shortDesc: 'Filter by third option',
              longDesc: 'Find variants with a specific value for their third option.',
            },
            taxable: {
              displayName: 'Taxable',
              shortDesc: 'Filter by tax status',
              longDesc: 'Find variants based on whether they are taxable or non-taxable.',
            },
            updatedAt: {
              displayName: 'Updated At',
              shortDesc: 'Filter by update time',
              longDesc:
                'Find variants based on when they were last updated (e.g., "updated_at:>2023-01-01" or "updated_at:<now").',
            },
            rawQuery: {
              displayName: 'Advanced Query',
              shortDesc: 'Use custom search syntax',
              longDesc:
                'Enter a custom search query for advanced filtering using Shopify search syntax.',
            },
            sortKey: {
              displayName: 'Sort By',
              shortDesc: 'Order results by field',
              longDesc: 'Specify which field to use for sorting the results.',
            },
            reverse: {
              displayName: 'Reverse Order',
              shortDesc: 'Reverse the sort order',
              longDesc:
                'When enabled, reverses the order of the results (e.g., Z-A instead of A-Z).',
            },
            limit: {
              displayName: 'Results Limit',
              shortDesc: 'Maximum number of results',
              longDesc:
                'Specify the maximum number of variants to return in the search results (max: 250).',
            },
            cursor: {
              displayName: 'Pagination Cursor',
              shortDesc: 'Navigate through pages of results',
              longDesc: 'Use a cursor to paginate through large sets of search results.',
            },
          },
        },
        'add-line-item-to-order': {
          displayName: 'Add Line Item to Order',
          shortDesc: 'Add a new product line to an existing order',
          longDesc:
            'Allows adding a new line item to an existing order, with options for quantity, pricing, and other product details',
          options: {
            orderId: {
              displayName: 'Order ID',
              shortDesc: 'Unique identifier of the order',
              longDesc: 'The specific order to which the line item will be added',
            },
            type: {
              displayName: 'Line Item Type',
              shortDesc: 'Type of line item being added',
              longDesc: 'Specifies the nature of the line item (e.g., product, shipping, tax)',
            },
            quantity: {
              displayName: 'Quantity',
              shortDesc: 'Number of items to add',
              longDesc: 'The quantity of the specific product being added to the order',
            },
            locationId: {
              displayName: 'Location ID',
              shortDesc: 'Inventory location',
              longDesc: 'The specific warehouse or store location where the item is stocked',
            },
            reason: {
              displayName: 'Reason',
              shortDesc: 'Reason for adding line item',
              longDesc: 'Explanation for why the line item is being added to the order',
            },
            notifyCustomer: {
              displayName: 'Notify Customer',
              shortDesc: 'Send notification about order change',
              longDesc:
                'Determines whether the customer should be notified about the line item addition',
            },
            variantId: {
              displayName: 'Variant ID',
              shortDesc: 'Specific product variant',
              longDesc: 'Unique identifier for the specific product variant being added',
            },
            allowDuplicates: {
              displayName: 'Allow Duplicates',
              shortDesc: 'Permit duplicate line items',
              longDesc: 'Whether identical line items can be added multiple times to the order',
            },
            itemName: {
              displayName: 'Item Name',
              shortDesc: 'Name of the product',
              longDesc: 'The display name or title of the product being added',
            },
            price: {
              displayName: 'Price',
              shortDesc: 'Price of the line item',
              longDesc: 'The unit price of the product being added to the order',
            },
            currency: {
              displayName: 'Currency',
              shortDesc: 'Currency of the price',
              longDesc: 'The currency in which the price is specified',
            },
            isTaxable: {
              displayName: 'Is Taxable',
              shortDesc: 'Whether item is subject to tax',
              longDesc: 'Indicates if the line item should have tax applied',
            },
            isPhysical: {
              displayName: 'Is Physical',
              shortDesc: 'Physical vs digital product',
              longDesc: 'Specifies whether the item is a physical product requiring shipping',
            },
          },
        },
        'create-gift-card': {
          displayName: 'Create Gift Card',
          shortDesc: 'Generate a new gift card',
          longDesc:
            'Create a gift card with customizable parameters like initial value, expiration, and recipient details',
          options: {
            initialValue: {
              displayName: 'Initial Value',
              shortDesc: 'Starting balance of gift card',
              longDesc: 'The initial monetary amount loaded onto the gift card',
            },
            customerId: {
              displayName: 'Customer ID',
              shortDesc: 'ID of gift card recipient',
              longDesc: 'The unique identifier of the customer receiving the gift card',
            },
            note: {
              displayName: 'Note',
              shortDesc: 'Additional gift card information',
              longDesc: 'A personal message or additional details about the gift card',
            },
            expiresOn: {
              displayName: 'Expiration Date',
              shortDesc: 'Date when gift card expires',
              longDesc: 'The date after which the gift card will no longer be valid',
            },
            code: {
              displayName: 'Gift Card Code',
              shortDesc: 'Unique gift card identifier',
              longDesc: 'The specific code used to redeem the gift card',
            },
            templateSuffix: {
              displayName: 'Template Suffix',
              shortDesc: 'Customization of gift card template',
              longDesc: "Optional suffix to customize the gift card's appearance or template",
            },
            recipientAttributes: {
              displayName: 'Recipient Attributes',
              shortDesc: 'Details about gift card recipient',
              longDesc: 'Additional information about the person receiving the gift card',
              type: {
                fields: {
                  id: {
                    displayName: 'Recipient ID',
                    shortDesc: 'Unique identifier for recipient',
                    longDesc: 'A unique identifier for the gift card recipient',
                  },
                  message: {
                    displayName: 'Recipient Message',
                    shortDesc: 'Personal message to recipient',
                    longDesc: 'A personalized message to accompany the gift card',
                  },
                  preferredName: {
                    displayName: 'Preferred Name',
                    shortDesc: "Recipient's preferred name",
                    longDesc: 'The name the recipient prefers to be called',
                  },
                  sendNotificationAt: {
                    displayName: 'Notification Timing',
                    shortDesc: 'When to send gift card notification',
                    longDesc: 'The specific time or date to send the gift card notification',
                  },
                },
              },
            },
          },
        },
        'create-fulfillment': {
          displayName: 'Create Fulfillment',
          shortDesc: 'Process and ship an order',
          longDesc: 'Create a fulfillment for an order, handling shipping and tracking information',
          options: {
            fulfillmentOrderId: {
              displayName: 'Fulfillment Order ID',
              shortDesc: 'Unique fulfillment order identifier',
              longDesc: 'The specific fulfillment order being processed',
            },
            fulfillmentOrderLineItems: {
              displayName: 'Fulfillment Order Line Items',
              shortDesc: 'Items in the fulfillment order',
              longDesc: 'Specific line items within the fulfillment order',
              type: {
                fields: {
                  id: {
                    displayName: 'Line Item ID',
                    shortDesc: 'Unique identifier for line item',
                    longDesc: 'The specific identifier for an individual line item',
                  },
                  quantity: {
                    displayName: 'Quantity',
                    shortDesc: 'Number of items to fulfill',
                    longDesc: 'The quantity of the specific item being fulfilled',
                  },
                },
              },
            },
            notifyCustomer: {
              displayName: 'Notify Customer',
              shortDesc: 'Send shipping notification',
              longDesc:
                'Determines whether to send a notification to the customer about the fulfillment',
            },
            trackingInfo: {
              displayName: 'Tracking Information',
              shortDesc: 'Shipping tracking details',
              longDesc: 'Information for tracking the shipment',
              type: {
                fields: {
                  number: {
                    displayName: 'Tracking Number',
                    shortDesc: 'Shipment tracking number',
                    longDesc: 'The unique identifier for tracking the shipment',
                  },
                  url: {
                    displayName: 'Tracking URL',
                    shortDesc: 'Link to track shipment',
                    longDesc: 'The web address where the shipment can be tracked',
                  },
                  company: {
                    displayName: 'Shipping Company',
                    shortDesc: 'Name of shipping carrier',
                    longDesc: 'The name of the company responsible for shipping',
                  },
                },
              },
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Additional fulfillment notes',
              longDesc: 'Any additional information or notes about the fulfillment',
            },
            originAddress: {
              displayName: 'Origin Address',
              shortDesc: 'Shipping origin location',
              longDesc: 'The address from which the items are being shipped',
              type: {
                fields: {
                  address1: {
                    displayName: 'Address Line 1',
                    shortDesc: 'Primary address line',
                    longDesc: 'The first line of the shipping origin address',
                  },
                  address2: {
                    displayName: 'Address Line 2',
                    shortDesc: 'Secondary address line',
                    longDesc: 'Optional additional address information',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'City of origin',
                    longDesc: 'The city from which the shipment originates',
                  },
                  countryCode: {
                    displayName: 'Country Code',
                    shortDesc: 'Origin country code',
                    longDesc: 'The two-letter country code for the shipping origin',
                  },
                  provinceCode: {
                    displayName: 'Province Code',
                    shortDesc: 'State or province code',
                    longDesc: 'The code representing the state or province of origin',
                  },
                  zip: {
                    displayName: 'Postal Code',
                    shortDesc: 'Origin postal code',
                    longDesc: 'The postal code of the shipping origin',
                  },
                },
              },
            },
          },
        },
        'create-draft-order': {
          displayName: 'Create Draft Order',
          shortDesc: 'Creates a new draft order in Shopify',
          longDesc:
            'Generates a draft order that can be used to create an order manually, send invoices, or process payments later. Draft orders are useful for custom sales, wholesale orders, or pre-orders.',
          options: {
            customerId: {
              displayName: 'Customer ID',
              shortDesc: 'The ID of the customer for the draft order',
              longDesc:
                'Specifies the unique identifier of the customer to associate with this draft order. Required if not using default address.',
            },
            email: {
              displayName: 'Email',
              shortDesc: 'Customer email address',
              longDesc:
                'The email address of the customer, used for notifications and order confirmation.',
            },
            phone: {
              displayName: 'Phone',
              shortDesc: 'Customer phone number',
              longDesc:
                'The phone number of the customer, useful for shipping updates or contact purposes.',
            },
            note: {
              displayName: 'Note',
              shortDesc: 'Additional notes for the draft order',
              longDesc:
                'A field for adding internal notes about the draft order, such as special instructions or context.',
            },
            taxExempt: {
              displayName: 'Tax Exempt',
              shortDesc: 'Exempt order from taxes',
              longDesc:
                'Indicates whether the entire order is exempt from taxes. Set to true for tax-exempt customers.',
            },
            taxExemptions: {
              displayName: 'Tax Exemptions',
              shortDesc: 'Specific tax exemptions',
              longDesc:
                'List of specific tax exemptions applied to the draft order, such as regional or product-specific exemptions.',
              type: {
                element_type: {
                  displayName: 'Tax Exemption Type',
                  shortDesc: 'Type of tax exemption',
                  longDesc:
                    'Defines the specific tax exemption applied, e.g., GST, VAT, or sales tax.',
                },
              },
            },
            tags: {
              displayName: 'Tags',
              shortDesc: 'Tags for the draft order',
              longDesc:
                'A list of tags to categorize or filter the draft order, e.g., "wholesale", "pre-order".',
              type: {
                element_type: {
                  displayName: 'Tag',
                  shortDesc: 'Single tag value',
                  longDesc:
                    'A single string value used to tag the draft order for organization or search purposes.',
                },
              },
            },
            shippingAddress: {
              displayName: 'Shipping Address',
              shortDesc: 'Customer shipping address',
              longDesc:
                'The full shipping address where the order will be delivered, including all relevant fields.',
              type: {
                fields: {
                  address1: {
                    displayName: 'Address Line 1',
                    shortDesc: 'Primary address line',
                    longDesc: 'The street address or PO Box for shipping.',
                  },
                  address2: {
                    displayName: 'Address Line 2',
                    shortDesc: 'Secondary address line',
                    longDesc: 'Additional address information like apartment or suite number.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'Shipping city',
                    longDesc: 'The city for the shipping address.',
                  },
                  province: {
                    displayName: 'Province/State',
                    shortDesc: 'Shipping province or state',
                    longDesc: 'The province, state, or region for the shipping address.',
                  },
                  country: {
                    displayName: 'Country',
                    shortDesc: 'Shipping country',
                    longDesc: 'The country for the shipping address.',
                  },
                  zip: {
                    displayName: 'ZIP/Postal Code',
                    shortDesc: 'Shipping postal code',
                    longDesc: 'The ZIP or postal code for the shipping address.',
                  },
                  firstName: {
                    displayName: 'First Name',
                    shortDesc: 'Recipient first name',
                    longDesc: 'The first name of the shipping recipient.',
                  },
                  lastName: {
                    displayName: 'Last Name',
                    shortDesc: 'Recipient last name',
                    longDesc: 'The last name of the shipping recipient.',
                  },
                  company: {
                    displayName: 'Company',
                    shortDesc: 'Shipping company name',
                    longDesc:
                      'The company name associated with the shipping address, if applicable.',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: 'Shipping contact phone',
                    longDesc: 'The phone number for the shipping recipient.',
                  },
                },
              },
            },
            billingAddress: {
              displayName: 'Billing Address',
              shortDesc: 'Customer billing address',
              longDesc:
                'The address used for billing purposes, which may differ from the shipping address.',
              type: {
                fields: {
                  address1: {
                    displayName: 'Address Line 1',
                    shortDesc: 'Primary billing address line',
                    longDesc: 'The street address or PO Box for billing.',
                  },
                  address2: {
                    displayName: 'Address Line 2',
                    shortDesc: 'Secondary billing address line',
                    longDesc:
                      'Additional billing address information like apartment or suite number.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'Billing city',
                    longDesc: 'The city for the billing address.',
                  },
                  province: {
                    displayName: 'Province/State',
                    shortDesc: 'Billing province or state',
                    longDesc: 'The province, state, or region for the billing address.',
                  },
                  country: {
                    displayName: 'Country',
                    shortDesc: 'Billing country',
                    longDesc: 'The country for the billing address.',
                  },
                  zip: {
                    displayName: 'ZIP/Postal Code',
                    shortDesc: 'Billing postal code',
                    longDesc: 'The ZIP or postal code for the billing address.',
                  },
                  firstName: {
                    displayName: 'First Name',
                    shortDesc: 'Billing first name',
                    longDesc: 'The first name of the billing contact.',
                  },
                  lastName: {
                    displayName: 'Last Name',
                    shortDesc: 'Billing last name',
                    longDesc: 'The last name of the billing contact.',
                  },
                  company: {
                    displayName: 'Company',
                    shortDesc: 'Billing company name',
                    longDesc:
                      'The company name associated with the billing address, if applicable.',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: 'Billing contact phone',
                    longDesc: 'The phone number for the billing contact.',
                  },
                },
              },
            },
            useCustomerDefaultAddress: {
              displayName: 'Use Customer Default Address',
              shortDesc: 'Use customer’s default address',
              longDesc:
                'If true, uses the customer’s default shipping and billing address instead of custom ones.',
            },
            lineItems: {
              displayName: 'Line Items',
              shortDesc: 'Products in the draft order',
              longDesc:
                'A list of products or variants included in the draft order, with details like quantity and price.',
              type: {
                element_type: {
                  fields: {
                    variantId: {
                      displayName: 'Variant ID',
                      shortDesc: 'Product variant ID',
                      longDesc:
                        'The unique identifier of the product variant to include in the order.',
                    },
                    quantity: {
                      displayName: 'Quantity',
                      shortDesc: 'Number of items',
                      longDesc:
                        'The number of units of this variant to include in the draft order.',
                    },
                    title: {
                      displayName: 'Title',
                      shortDesc: 'Item title',
                      longDesc:
                        'The display name of the line item, typically the product or variant name.',
                    },
                    originalUnitPrice: {
                      displayName: 'Original Unit Price',
                      shortDesc: 'Price per unit',
                      longDesc: 'The original price per unit of the item before discounts.',
                    },
                    originalUnitPriceWithCurrency: {
                      displayName: 'Original Unit Price with Currency',
                      shortDesc: 'Price with currency details',
                      longDesc: 'The original unit price including currency specification.',
                      type: {
                        fields: {
                          amount: {
                            displayName: 'Amount',
                            shortDesc: 'Price amount',
                            longDesc: 'The numerical value of the unit price.',
                          },
                          currencyCode: {
                            displayName: 'Currency Code',
                            shortDesc: 'Currency code',
                            longDesc: 'The ISO 4217 currency code for the price, e.g., USD, EUR.',
                          },
                        },
                      },
                    },
                    sku: {
                      displayName: 'SKU',
                      shortDesc: 'Stock Keeping Unit',
                      longDesc: 'The stock keeping unit identifier for the product variant.',
                    },
                    requiresShipping: {
                      displayName: 'Requires Shipping',
                      shortDesc: 'Needs shipping',
                      longDesc: 'Indicates if the item requires physical shipping.',
                    },
                    taxable: {
                      displayName: 'Taxable',
                      shortDesc: 'Subject to tax',
                      longDesc: 'Specifies whether the item is taxable.',
                    },
                    weight: {
                      displayName: 'Weight',
                      shortDesc: 'Item weight',
                      longDesc: 'The weight of the item, used for shipping calculations.',
                      type: {
                        fields: {
                          value: {
                            displayName: 'Weight Value',
                            shortDesc: 'Numerical weight',
                            longDesc: 'The numerical value of the item’s weight.',
                          },
                          unit: {
                            displayName: 'Weight Unit',
                            shortDesc: 'Unit of weight',
                            longDesc: 'The unit of measurement for the weight, e.g., kg, lb.',
                          },
                        },
                      },
                    },
                    customAttributes: {
                      displayName: 'Custom Attributes',
                      shortDesc: 'Additional item attributes',
                      longDesc: 'Key-value pairs for adding custom metadata to the line item.',
                      type: {
                        element_type: {
                          fields: {
                            key: {
                              displayName: 'Key',
                              shortDesc: 'Attribute key',
                              longDesc: 'The identifier for the custom attribute.',
                            },
                            value: {
                              displayName: 'Value',
                              shortDesc: 'Attribute value',
                              longDesc: 'The value associated with the custom attribute key.',
                            },
                          },
                        },
                      },
                    },
                    appliedDiscount: {
                      displayName: 'Applied Discount',
                      shortDesc: 'Discount on item',
                      longDesc: 'Details of any discount applied to this specific line item.',
                      type: {
                        fields: {
                          title: {
                            displayName: 'Discount Title',
                            shortDesc: 'Discount name',
                            longDesc: 'The name or title of the discount.',
                          },
                          description: {
                            displayName: 'Discount Description',
                            shortDesc: 'Discount details',
                            longDesc: 'A description of the discount applied.',
                          },
                          value: {
                            displayName: 'Discount Value',
                            shortDesc: 'Discount amount or percentage',
                            longDesc:
                              'The numerical value of the discount, either as a fixed amount or percentage.',
                          },
                          valueType: {
                            displayName: 'Value Type',
                            shortDesc: 'Type of discount value',
                            longDesc:
                              'Specifies if the discount is a fixed amount or percentage (e.g., "FIXED_AMOUNT", "PERCENTAGE").',
                          },
                          amountWithCurrency: {
                            displayName: 'Amount with Currency',
                            shortDesc: 'Discount amount with currency',
                            longDesc: 'The discount amount including currency details.',
                            type: {
                              fields: {
                                amount: {
                                  displayName: 'Amount',
                                  shortDesc: 'Discount amount',
                                  longDesc: 'The numerical value of the discount.',
                                },
                                currencyCode: {
                                  displayName: 'Currency Code',
                                  shortDesc: 'Discount currency',
                                  longDesc: 'The ISO 4217 currency code for the discount amount.',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    generatePriceOverride: {
                      displayName: 'Generate Price Override',
                      shortDesc: 'Override item price',
                      longDesc:
                        'If true, allows setting a custom price for the item instead of the original price.',
                    },
                    priceOverride: {
                      displayName: 'Price Override',
                      shortDesc: 'Custom item price',
                      longDesc: 'The custom price to override the original unit price.',
                      type: {
                        fields: {
                          amount: {
                            displayName: 'Amount',
                            shortDesc: 'Override amount',
                            longDesc: 'The numerical value of the custom price.',
                          },
                          currencyCode: {
                            displayName: 'Currency Code',
                            shortDesc: 'Override currency',
                            longDesc: 'The ISO 4217 currency code for the custom price.',
                          },
                        },
                      },
                    },
                    components: {
                      displayName: 'Components',
                      shortDesc: 'Bundle components',
                      longDesc:
                        'Details of components if the item is a bundle or composite product.',
                      type: {
                        element_type: {
                          fields: {
                            quantity: {
                              displayName: 'Quantity',
                              shortDesc: 'Component quantity',
                              longDesc: 'The number of units of this component in the bundle.',
                            },
                            variantId: {
                              displayName: 'Variant ID',
                              shortDesc: 'Component variant ID',
                              longDesc:
                                'The unique identifier of the variant included as a component.',
                            },
                          },
                        },
                      },
                    },
                    uuid: {
                      displayName: 'UUID',
                      shortDesc: 'Unique identifier',
                      longDesc:
                        'A unique identifier for the line item, often used for tracking or external systems.',
                    },
                  },
                },
              },
            },
            appliedDiscount: {
              displayName: 'Applied Discount',
              shortDesc: 'Order-wide discount',
              longDesc: 'Details of a discount applied to the entire draft order.',
              type: {
                fields: {
                  title: {
                    displayName: 'Discount Title',
                    shortDesc: 'Discount name',
                    longDesc: 'The name or title of the order-wide discount.',
                  },
                  description: {
                    displayName: 'Discount Description',
                    shortDesc: 'Discount details',
                    longDesc: 'A description of the order-wide discount.',
                  },
                  value: {
                    displayName: 'Discount Value',
                    shortDesc: 'Discount amount or percentage',
                    longDesc:
                      'The numerical value of the discount, either as a fixed amount or percentage.',
                  },
                  valueType: {
                    displayName: 'Value Type',
                    shortDesc: 'Type of discount value',
                    longDesc:
                      'Specifies if the discount is a fixed amount or percentage (e.g., "FIXED_AMOUNT", "PERCENTAGE").',
                  },
                  amountWithCurrency: {
                    displayName: 'Amount with Currency',
                    shortDesc: 'Discount amount with currency',
                    longDesc: 'The discount amount including currency details.',
                    type: {
                      fields: {
                        amount: {
                          displayName: 'Amount',
                          shortDesc: 'Discount amount',
                          longDesc: 'The numerical value of the discount.',
                        },
                        currencyCode: {
                          displayName: 'Currency Code',
                          shortDesc: 'Discount currency',
                          longDesc: 'The ISO 4217 currency code for the discount amount.',
                        },
                      },
                    },
                  },
                },
              },
            },
            shippingLine: {
              displayName: 'Shipping Line',
              shortDesc: 'Shipping details',
              longDesc: 'Details about the shipping method and cost for the draft order.',
              type: {
                fields: {
                  price: {
                    displayName: 'Price',
                    shortDesc: 'Shipping cost',
                    longDesc: 'The cost of shipping as a numerical value.',
                  },
                  priceWithCurrency: {
                    displayName: 'Price with Currency',
                    shortDesc: 'Shipping cost with currency',
                    longDesc: 'The shipping cost including currency specification.',
                    type: {
                      fields: {
                        amount: {
                          displayName: 'Amount',
                          shortDesc: 'Shipping amount',
                          longDesc: 'The numerical value of the shipping cost.',
                        },
                        currencyCode: {
                          displayName: 'Currency Code',
                          shortDesc: 'Shipping currency',
                          longDesc: 'The ISO 4217 currency code for the shipping cost.',
                        },
                      },
                    },
                  },
                  title: {
                    displayName: 'Title',
                    shortDesc: 'Shipping method name',
                    longDesc: 'The name of the shipping method, e.g., "Standard Shipping".',
                  },
                  shippingRateHandle: {
                    displayName: 'Shipping Rate Handle',
                    shortDesc: 'Shipping rate identifier',
                    longDesc:
                      'A unique identifier for the shipping rate, often tied to a predefined rate in Shopify.',
                  },
                },
              },
            },
            customAttributes: {
              displayName: 'Custom Attributes',
              shortDesc: 'Order custom attributes',
              longDesc: 'Key-value pairs for adding custom metadata to the draft order.',
              type: {
                element_type: {
                  fields: {
                    key: {
                      displayName: 'Key',
                      shortDesc: 'Attribute key',
                      longDesc: 'The identifier for the custom attribute.',
                    },
                    value: {
                      displayName: 'Value',
                      shortDesc: 'Attribute value',
                      longDesc: 'The value associated with the custom attribute key.',
                    },
                  },
                },
              },
            },
            allowDiscountCodesInCheckout: {
              displayName: 'Allow Discount Codes in Checkout',
              shortDesc: 'Enable discount codes',
              longDesc:
                'If true, allows customers to apply discount codes during checkout from this draft order.',
            },
            acceptAutomaticDiscounts: {
              displayName: 'Accept Automatic Discounts',
              shortDesc: 'Apply automatic discounts',
              longDesc:
                'If true, automatically applies any eligible store-wide discounts to the draft order.',
            },
            discountCodes: {
              displayName: 'Discount Codes',
              shortDesc: 'List of discount codes',
              longDesc: 'A list of discount codes to apply to the draft order.',
              type: {
                element_type: {
                  displayName: 'Discount Code',
                  shortDesc: 'Single discount code',
                  longDesc: 'A specific discount code to apply to the order.',
                },
              },
            },
            metafields: {
              displayName: 'Metafields',
              shortDesc: 'Custom metadata',
              longDesc:
                'Additional metadata fields for the draft order, useful for custom integrations.',
              type: {
                element_type: {
                  fields: {
                    namespace: {
                      displayName: 'Namespace',
                      shortDesc: 'Metafield namespace',
                      longDesc: 'A grouping identifier for the metafield.',
                    },
                    key: {
                      displayName: 'Key',
                      shortDesc: 'Metafield key',
                      longDesc: 'The specific identifier for the metafield.',
                    },
                    value: {
                      displayName: 'Value',
                      shortDesc: 'Metafield value',
                      longDesc: 'The value stored in the metafield.',
                    },
                    type: {
                      displayName: 'Type',
                      shortDesc: 'Metafield data type',
                      longDesc:
                        'The data type of the metafield value, e.g., string, integer, JSON.',
                    },
                  },
                },
              },
            },
            localizedFields: {
              displayName: 'Localized Fields',
              shortDesc: 'Localized content',
              longDesc: 'Fields that support localized content for different regions or languages.',
              type: {
                element_type: {
                  fields: {
                    value: {
                      displayName: 'Value',
                      shortDesc: 'Localized value',
                      longDesc: 'The localized content value.',
                    },
                    key: {
                      displayName: 'Key',
                      shortDesc: 'Localized field key',
                      longDesc: 'The identifier for the localized field.',
                    },
                    locale: {
                      displayName: 'Locale',
                      shortDesc: 'Language/region code',
                      longDesc:
                        'The locale code for the localized content, e.g., "en-US", "fr-CA".',
                    },
                  },
                },
              },
            },
            presentmentCurrencyCode: {
              displayName: 'Presentment Currency Code',
              shortDesc: 'Display currency',
              longDesc:
                'The ISO 4217 currency code for displaying prices to the customer, e.g., USD, CAD.',
            },
            poNumber: {
              displayName: 'PO Number',
              shortDesc: 'Purchase order number',
              longDesc:
                'The purchase order number associated with the draft order, often used for B2B transactions.',
            },
            paymentTerms: {
              displayName: 'Payment Terms',
              shortDesc: 'Payment conditions',
              longDesc:
                'Defines the payment terms for the draft order, such as due dates or schedules.',
              type: {
                fields: {
                  paymentTermsTemplateId: {
                    displayName: 'Payment Terms Template ID',
                    shortDesc: 'Template identifier',
                    longDesc: 'The ID of a predefined payment terms template in Shopify.',
                  },
                  paymentSchedules: {
                    displayName: 'Payment Schedules',
                    shortDesc: 'Payment due dates',
                    longDesc: 'A list of scheduled payments with due dates and amounts.',
                    type: {
                      element_type: {
                        fields: {
                          dueAt: {
                            displayName: 'Due At',
                            shortDesc: 'Due date',
                            longDesc: 'The date when the payment is due.',
                          },
                          amount: {
                            displayName: 'Amount',
                            shortDesc: 'Payment amount',
                            longDesc: 'The numerical value of the payment due.',
                          },
                          currencyCode: {
                            displayName: 'Currency Code',
                            shortDesc: 'Payment currency',
                            longDesc: 'The ISO 4217 currency code for the payment amount.',
                          },
                          issuedAt: {
                            displayName: 'Issued At',
                            shortDesc: 'Issue date',
                            longDesc: 'The date when the payment schedule was issued.',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            purchasingEntity: {
              displayName: 'Purchasing Entity',
              shortDesc: 'Buyer details',
              longDesc:
                'Details about the entity making the purchase, such as a company or individual.',
              type: {
                fields: {
                  customerId: {
                    displayName: 'Customer ID',
                    shortDesc: 'Purchaser customer ID',
                    longDesc: 'The ID of the customer making the purchase.',
                  },
                  companyId: {
                    displayName: 'Company ID',
                    shortDesc: 'Purchaser company ID',
                    longDesc: 'The ID of the company making the purchase.',
                  },
                  companyLocationId: {
                    displayName: 'Company Location ID',
                    shortDesc: 'Company location ID',
                    longDesc: 'The ID of the specific company location making the purchase.',
                  },
                  companyContactId: {
                    displayName: 'Company Contact ID',
                    shortDesc: 'Contact ID',
                    longDesc: 'The ID of the company contact responsible for the purchase.',
                  },
                },
              },
            },
            reserveInventoryUntil: {
              displayName: 'Reserve Inventory Until',
              shortDesc: 'Inventory reservation deadline',
              longDesc:
                'The date and time until which the inventory is reserved for this draft order.',
            },
            sourceName: {
              displayName: 'Source Name',
              shortDesc: 'Order source',
              longDesc: 'The source of the draft order, e.g., "web", "manual", or an app name.',
            },
            visibleToCustomer: {
              displayName: 'Visible to Customer',
              shortDesc: 'Customer visibility',
              longDesc:
                'If true, the draft order is visible to the customer, e.g., in their account.',
            },
          },
        },
        'create-customer': {
          displayName: 'Create Customer',
          shortDesc: 'Creates a new customer in Shopify',
          longDesc:
            'Adds a new customer to the Shopify store, allowing you to store their contact information, addresses, and marketing preferences for future orders and engagement.',
          options: {
            email: {
              displayName: 'Email',
              shortDesc: 'Customer email address',
              longDesc:
                'The primary email address of the customer, used for account creation, notifications, and marketing.',
            },
            phone: {
              displayName: 'Phone',
              shortDesc: 'Customer phone number',
              longDesc:
                'The customer’s phone number, useful for contact purposes and SMS marketing if consented.',
            },
            firstName: {
              displayName: 'First Name',
              shortDesc: 'Customer first name',
              longDesc:
                'The first name of the customer, used for personalization and address details.',
            },
            lastName: {
              displayName: 'Last Name',
              shortDesc: 'Customer last name',
              longDesc:
                'The last name of the customer, completing their full name for identification and shipping.',
            },
            locale: {
              displayName: 'Locale',
              shortDesc: 'Customer language/region',
              longDesc:
                'The preferred language and region code for the customer, e.g., "en-US" or "fr-CA", affecting communication and formatting.',
            },
            note: {
              displayName: 'Note',
              shortDesc: 'Notes about the customer',
              longDesc:
                'Internal notes about the customer, such as preferences, special instructions, or account details.',
            },
            taxExempt: {
              displayName: 'Tax Exempt',
              shortDesc: 'Exempt customer from taxes',
              longDesc:
                'Indicates whether the customer is exempt from taxes on all purchases. Set to true for tax-exempt entities.',
            },
            taxExemptions: {
              displayName: 'Tax Exemptions',
              shortDesc: 'Specific tax exemptions',
              longDesc:
                'A list of specific tax exemptions applied to the customer, such as regional or category-specific exemptions.',
              type: {
                element_type: {
                  displayName: 'Tax Exemption Type',
                  shortDesc: 'Type of tax exemption',
                  longDesc:
                    'Defines the specific tax exemption applied, e.g., GST, VAT, or sales tax.',
                },
              },
            },
            tags: {
              displayName: 'Tags',
              shortDesc: 'Customer tags',
              longDesc:
                'A list of tags to categorize or filter the customer, e.g., "VIP", "wholesale", "new".',
              type: {
                element_type: {
                  displayName: 'Tag',
                  shortDesc: 'Single tag value',
                  longDesc:
                    'A single string value used to tag the customer for organization or segmentation.',
                },
              },
            },
            addresses: {
              displayName: 'Addresses',
              shortDesc: 'Customer addresses',
              longDesc:
                'A list of addresses associated with the customer, such as shipping or billing addresses.',
              type: {
                element_type: {
                  fields: {
                    address1: {
                      displayName: 'Address Line 1',
                      shortDesc: 'Primary address line',
                      longDesc: 'The street address or PO Box for the customer.',
                    },
                    address2: {
                      displayName: 'Address Line 2',
                      shortDesc: 'Secondary address line',
                      longDesc: 'Additional address information like apartment or suite number.',
                    },
                    city: {
                      displayName: 'City',
                      shortDesc: 'Customer city',
                      longDesc: 'The city associated with the customer’s address.',
                    },
                    province: {
                      displayName: 'Province/State',
                      shortDesc: 'Customer province or state',
                      longDesc: 'The province, state, or region for the customer’s address.',
                    },
                    country: {
                      displayName: 'Country',
                      shortDesc: 'Customer country',
                      longDesc: 'The country for the customer’s address.',
                    },
                    zip: {
                      displayName: 'ZIP/Postal Code',
                      shortDesc: 'Customer postal code',
                      longDesc: 'The ZIP or postal code for the customer’s address.',
                    },
                    firstName: {
                      displayName: 'First Name',
                      shortDesc: 'Address first name',
                      longDesc: 'The first name associated with this specific address.',
                    },
                    lastName: {
                      displayName: 'Last Name',
                      shortDesc: 'Address last name',
                      longDesc: 'The last name associated with this specific address.',
                    },
                    company: {
                      displayName: 'Company',
                      shortDesc: 'Address company name',
                      longDesc: 'The company name tied to this address, if applicable.',
                    },
                    phone: {
                      displayName: 'Phone',
                      shortDesc: 'Address phone number',
                      longDesc: 'The phone number linked to this specific address.',
                    },
                  },
                },
              },
            },
            emailMarketingConsent: {
              displayName: 'Email Marketing Consent',
              shortDesc: 'Email marketing preferences',
              longDesc:
                'Details about the customer’s consent to receive email marketing communications.',
              type: {
                fields: {
                  marketingState: {
                    displayName: 'Marketing State',
                    shortDesc: 'Consent status',
                    longDesc:
                      'The current state of email marketing consent, e.g., "SUBSCRIBED", "UNSUBSCRIBED", or "PENDING".',
                  },
                  marketingOptInLevel: {
                    displayName: 'Marketing Opt-In Level',
                    shortDesc: 'Opt-in level',
                    longDesc:
                      'The level of consent provided, e.g., "SINGLE_OPT_IN" or "CONFIRMED_OPT_IN", based on how consent was obtained.',
                  },
                },
              },
            },
            smsMarketingConsent: {
              displayName: 'SMS Marketing Consent',
              shortDesc: 'SMS marketing preferences',
              longDesc: 'Details about the customer’s consent to receive SMS marketing messages.',
              type: {
                fields: {
                  marketingState: {
                    displayName: 'Marketing State',
                    shortDesc: 'Consent status',
                    longDesc:
                      'The current state of SMS marketing consent, e.g., "SUBSCRIBED", "UNSUBSCRIBED", or "PENDING".',
                  },
                  marketingOptInLevel: {
                    displayName: 'Marketing Opt-In Level',
                    shortDesc: 'Opt-in level',
                    longDesc:
                      'The level of consent provided for SMS, e.g., "SINGLE_OPT_IN" or "CONFIRMED_OPT_IN".',
                  },
                },
              },
            },
            metafields: {
              displayName: 'Metafields',
              shortDesc: 'Custom metadata',
              longDesc:
                'Additional metadata fields for the customer, useful for custom integrations or data storage.',
              type: {
                element_type: {
                  fields: {
                    namespace: {
                      displayName: 'Namespace',
                      shortDesc: 'Metafield namespace',
                      longDesc: 'A grouping identifier for the metafield to organize related data.',
                    },
                    key: {
                      displayName: 'Key',
                      shortDesc: 'Metafield key',
                      longDesc: 'The specific identifier for the metafield.',
                    },
                    value: {
                      displayName: 'Value',
                      shortDesc: 'Metafield value',
                      longDesc:
                        'The value stored in the metafield, which can be a string, number, or JSON.',
                    },
                    type: {
                      displayName: 'Type',
                      shortDesc: 'Metafield data type',
                      longDesc:
                        'The data type of the metafield value, e.g., "string", "integer", "json".',
                    },
                  },
                },
              },
            },
          },
        },
        'create-blog-entry': {
          displayName: 'Create Blog Entry',
          shortDesc: 'Creates a new blog post in Shopify',
          longDesc:
            'Adds a new blog post to a specified blog in your Shopify store, allowing you to publish content such as articles, news, or updates for customers.',
          options: {
            blogId: {
              displayName: 'Blog ID',
              shortDesc: 'ID of the target blog',
              longDesc:
                'The unique identifier of the blog where the new entry will be created. Required to associate the post with a specific blog.',
            },
            title: {
              displayName: 'Title',
              shortDesc: 'Blog post title',
              longDesc: 'The headline or title of the blog post, displayed prominently to readers.',
            },
            content: {
              displayName: 'Content',
              shortDesc: 'Blog post content',
              longDesc:
                'The main body of the blog post, which can include text, HTML, or other formatted content to convey the message or story.',
            },
            author: {
              displayName: 'Author',
              shortDesc: 'Author of the blog post',
              longDesc:
                'The name of the person or entity credited with writing the blog post, displayed as the author.',
            },
            tags: {
              displayName: 'Tags',
              shortDesc: 'Tags for the blog post',
              longDesc:
                'A list of keywords or categories to tag the blog post, aiding in searchability and organization.',
              type: {
                element_type: {
                  displayName: 'Tag',
                  shortDesc: 'Single tag value',
                  longDesc:
                    'A single string value used to tag the blog post, e.g., "news", "tutorial", "promotion".',
                },
              },
            },
            summary: {
              displayName: 'Summary',
              shortDesc: 'Blog post summary',
              longDesc:
                'A brief overview or excerpt of the blog post, often used as a teaser or preview in blog listings.',
            },
            published: {
              displayName: 'Published',
              shortDesc: 'Publication status',
              longDesc:
                'Indicates whether the blog post is published (true) or saved as a draft (false) upon creation.',
            },
            image: {
              displayName: 'Image',
              shortDesc: 'Featured image for the post',
              longDesc:
                'The primary image associated with the blog post, used for visual appeal in previews or headers.',
              type: {
                fields: {
                  altText: {
                    displayName: 'Alt Text',
                    shortDesc: 'Image alt text',
                    longDesc:
                      'Descriptive text for the image, used for accessibility and SEO purposes.',
                  },
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Image URL',
                    longDesc:
                      'The web address or source location of the image file to be used in the blog post.',
                  },
                },
              },
            },
          },
        },
        'add-tag-to-customer': {
          displayName: 'Add Tag to Customer',
          shortDesc: 'Adds tags to an existing customer',
          longDesc:
            'Appends or replaces tags for a specified customer in Shopify, useful for categorization, segmentation, or tracking purposes.',
          options: {
            customerId: {
              displayName: 'Customer ID',
              shortDesc: 'ID of the customer',
              longDesc:
                'The unique identifier of the customer to whom tags will be added. Required to target the correct customer.',
            },
            tags: {
              displayName: 'Tags',
              shortDesc: 'Tags to add',
              longDesc:
                'A list of tags to apply to the customer, such as "VIP", "loyal", or "newsletter". Can be appended or replace existing tags based on the append option.',
            },
            append: {
              displayName: 'Append',
              shortDesc: 'Append or replace tags',
              longDesc:
                'If true, adds the new tags to the existing ones; if false, replaces all existing tags with the new ones.',
            },
          },
        },
        'create-transaction': {
          displayName: 'Create Transaction',
          shortDesc: 'Creates a transaction for an order',
          longDesc:
            'Records a financial transaction (e.g., payment, refund) for a specific order in Shopify, linked to a payment gateway.',
          options: {
            orderId: {
              displayName: 'Order ID',
              shortDesc: 'ID of the order',
              longDesc:
                'The unique identifier of the order to which this transaction applies. Required to associate the transaction correctly.',
            },
            amount: {
              displayName: 'Amount',
              shortDesc: 'Transaction amount',
              longDesc:
                'The numerical value of the transaction, such as the amount paid or refunded.',
            },
            currency: {
              displayName: 'Currency',
              shortDesc: 'Transaction currency',
              longDesc:
                'The ISO 4217 currency code for the transaction amount, e.g., "USD", "EUR".',
            },
            type: {
              displayName: 'Type',
              shortDesc: 'Transaction type',
              longDesc:
                'The type of transaction, such as "authorization", "capture", "sale", or "refund". Defines the transaction’s purpose.',
            },
            parentTransactionId: {
              displayName: 'Parent Transaction ID',
              shortDesc: 'ID of parent transaction',
              longDesc:
                'The ID of a previous transaction this one relates to, e.g., for refunds or captures linked to an authorization.',
            },
            gateway: {
              displayName: 'Gateway',
              shortDesc: 'Payment gateway',
              longDesc:
                'The payment gateway used for the transaction, e.g., "shopify_payments", "paypal", or a custom gateway name.',
            },
            finalCapture: {
              displayName: 'Final Capture',
              shortDesc: 'Complete capture flag',
              longDesc:
                'If true, indicates this is the final capture of funds for an authorization; if false, partial captures may follow.',
            },
          },
        },
        'create-company': {
          displayName: 'Create Company',
          shortDesc: 'Creates a new company in Shopify',
          longDesc:
            'Adds a new company entity to Shopify, typically for B2B purposes, including contact and location details for wholesale or enterprise customers.',
          options: {
            companyName: {
              displayName: 'Name',
              shortDesc: 'Company name',
              longDesc:
                'The official name of the company, used for identification and display purposes.',
            },
            externalId: {
              displayName: 'External ID',
              shortDesc: 'External identifier',
              longDesc:
                'A unique identifier from an external system, useful for syncing or referencing the company outside Shopify.',
            },
            note: {
              displayName: 'Note',
              shortDesc: 'Company notes',
              longDesc:
                'Internal notes about the company, such as account details or special instructions.',
            },
            customerSince: {
              displayName: 'Customer Since',
              shortDesc: 'Start date',
              longDesc:
                'The date the company became a customer, formatted as a timestamp, useful for tracking tenure.',
            },
            contactProperties: {
              displayName: 'Contact Properties',
              shortDesc: 'Primary contact details',
              longDesc: 'Details about the primary contact person for the company.',
              type: {
                fields: {
                  firstName: {
                    displayName: 'First Name',
                    shortDesc: 'Contact first name',
                    longDesc: 'The first name of the company’s primary contact.',
                  },
                  lastName: {
                    displayName: 'Last Name',
                    shortDesc: 'Contact last name',
                    longDesc: 'The last name of the company’s primary contact.',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: 'Contact email',
                    longDesc: 'The email address of the primary contact, used for communication.',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: 'Contact phone',
                    longDesc: 'The phone number of the primary contact.',
                  },
                  title: {
                    displayName: 'Title',
                    shortDesc: 'Contact job title',
                    longDesc: 'The job title or role of the primary contact within the company.',
                  },
                  locale: {
                    displayName: 'Locale',
                    shortDesc: 'Contact language/region',
                    longDesc:
                      'The preferred language and region code for the contact, e.g., "en-US".',
                  },
                },
              },
            },
            locationProperties: {
              displayName: 'Location Properties',
              shortDesc: 'Company location details',
              longDesc:
                'Details about the company’s physical location, including shipping and billing addresses.',
              type: {
                fields: {
                  locationName: {
                    displayName: 'Location Name',
                    shortDesc: 'Name of location',
                    longDesc: 'A descriptive name for this company location, e.g., "Headquarters".',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: 'Location phone',
                    longDesc: 'The phone number associated with this company location.',
                  },
                  note: {
                    displayName: 'Note',
                    shortDesc: 'Location notes',
                    longDesc: 'Internal notes about this location, such as delivery instructions.',
                  },
                  externalId: {
                    displayName: 'External ID',
                    shortDesc: 'Location external ID',
                    longDesc:
                      'An external identifier for this location, useful for integration with other systems.',
                  },
                  taxExempt: {
                    displayName: 'Tax Exempt',
                    shortDesc: 'Tax exemption status',
                    longDesc: 'Indicates if this location is exempt from taxes.',
                  },
                  taxRegistrationId: {
                    displayName: 'Tax Registration ID',
                    shortDesc: 'Tax ID',
                    longDesc: 'The tax registration number for this location, e.g., VAT or EIN.',
                  },
                  taxExemptions: {
                    displayName: 'Tax Exemptions',
                    shortDesc: 'Specific tax exemptions',
                    longDesc: 'A list of specific tax exemptions applied to this location.',
                    type: {
                      element_type: {
                        displayName: 'Tax Exemption Type',
                        shortDesc: 'Type of exemption',
                        longDesc: 'Defines the specific tax exemption, e.g., "GST", "VAT".',
                      },
                    },
                  },
                  locale: {
                    displayName: 'Locale',
                    shortDesc: 'Location language/region',
                    longDesc:
                      'The preferred language and region code for this location, e.g., "en-CA".',
                  },
                  shippingAddress: {
                    displayName: 'Shipping Address',
                    shortDesc: 'Shipping address',
                    longDesc: 'The address where goods are shipped for this company location.',
                    type: {
                      fields: {
                        address1: {
                          displayName: 'Address Line 1',
                          shortDesc: 'Primary shipping line',
                          longDesc: 'The street address or PO Box for shipping.',
                        },
                        address2: {
                          displayName: 'Address Line 2',
                          shortDesc: 'Secondary shipping line',
                          longDesc: 'Additional shipping address details, e.g., suite number.',
                        },
                        city: {
                          displayName: 'City',
                          shortDesc: 'Shipping city',
                          longDesc: 'The city for the shipping address.',
                        },
                        zoneCode: {
                          displayName: 'Zone Code',
                          shortDesc: 'Province/state code',
                          longDesc:
                            'The code for the province or state, e.g., "CA" for California.',
                        },
                        countryCode: {
                          displayName: 'Country Code',
                          shortDesc: 'Country code',
                          longDesc: 'The ISO 3166-1 alpha-2 country code, e.g., "US".',
                        },
                        zip: {
                          displayName: 'ZIP/Postal Code',
                          shortDesc: 'Shipping postal code',
                          longDesc: 'The ZIP or postal code for the shipping address.',
                        },
                      },
                    },
                  },
                  billingSameAsShipping: {
                    displayName: 'Billing Same as Shipping',
                    shortDesc: 'Use shipping for billing',
                    longDesc: 'If true, the shipping address is also used as the billing address.',
                  },
                  billingAddress: {
                    displayName: 'Billing Address',
                    shortDesc: 'Billing address',
                    longDesc: 'The address used for billing purposes, if different from shipping.',
                    type: {
                      fields: {
                        address1: {
                          displayName: 'Address Line 1',
                          shortDesc: 'Primary billing line',
                          longDesc: 'The street address or PO Box for billing.',
                        },
                        address2: {
                          displayName: 'Address Line 2',
                          shortDesc: 'Secondary billing line',
                          longDesc: 'Additional billing address details, e.g., apartment number.',
                        },
                        city: {
                          displayName: 'City',
                          shortDesc: 'Billing city',
                          longDesc: 'The city for the billing address.',
                        },
                        zoneCode: {
                          displayName: 'Zone Code',
                          shortDesc: 'Province/state code',
                          longDesc: 'The code for the province or state, e.g., "NY".',
                        },
                        countryCode: {
                          displayName: 'Country Code',
                          shortDesc: 'Country code',
                          longDesc: 'The ISO 3166-1 alpha-2 country code, e.g., "CA".',
                        },
                        zip: {
                          displayName: 'ZIP/Postal Code',
                          shortDesc: 'Billing postal code',
                          longDesc: 'The ZIP or postal code for the billing address.',
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
      triggers: {
        'shopify-abandoned-cart-trigger': {
          displayName: 'Shopify New Abandoned Cart',
          shortDesc: 'Triggers when a customer abandons a checkout in Shopify',
          longDesc:
            'This trigger activates when a Shopify checkout is created but not completed within the specified time window. Use this to send recovery emails, offer discounts, or analyze cart abandonment patterns.',
          options: {
            abandonedHours: {
              displayName: 'Abandoned Hours',
              shortDesc: 'Time window to consider a cart abandoned',
              longDesc:
                'Specify how many hours must pass since cart creation without completion for it to be considered abandoned. Values range from 1 hour to 168 hours (one week).',
            },
          },
        },
        'shopify-blog-trigger': {
          displayName: 'Shopify Blog Created',
          shortDesc: 'Triggers when a new blog is created in Shopify',
          longDesc:
            'This trigger activates whenever a new blog (not an article) is created in your Shopify store. Use this to monitor blog creation or automate follow-up tasks.',
        },
        'shopify-blog-entry-trigger': {
          displayName: 'Shopify New Blog Article',
          shortDesc: 'Triggers when a blog article is created or published',
          longDesc:
            'This trigger activates when a new article is created or published in a specified Shopify blog. Use this to automate social media sharing, email notifications, or content distribution workflows.',
          options: {
            blogId: {
              displayName: 'Blog',
              shortDesc: 'Select the blog to monitor',
              longDesc: 'Choose which Shopify blog to monitor for new articles.',
            },
            entryStatus: {
              displayName: 'Article Status',
              shortDesc: 'Filter articles by publication status',
              longDesc:
                'Choose whether to trigger on all articles, only published articles, or only draft articles.',
            },
          },
        },
        'shopify-customer-created-trigger': {
          displayName: 'Shopify Customer Created',
          shortDesc: 'Triggers when a new customer account is created',
          longDesc:
            'This trigger activates whenever a new customer registers or is created in your Shopify store. Use this to send welcome emails, add customers to marketing lists, or create records in other systems.',
        },
        'shopify-customer-updated-trigger': {
          displayName: 'Shopify Customer Updated',
          shortDesc: 'Triggers when customer information is modified',
          longDesc:
            'This trigger activates whenever customer information is updated in your Shopify store. Use this to sync customer data with other systems, track specific customer changes, or update marketing preferences.',
        },
        'shopify-new-order-trigger': {
          displayName: 'Shopify New Order',
          shortDesc: 'Triggers when a new order is placed with the specified status',
          longDesc:
            'This trigger activates when a new order is created in your Shopify store that matches the specified status filter. Use this to process orders, update inventory in other systems, or send custom notifications based on order status.',
          options: {
            orderStatus: {
              displayName: 'Order Status',
              shortDesc: 'Filter orders by their status',
              longDesc:
                'Select which type of orders to monitor based on their status (e.g., any, paid, fulfilled, cancelled). This lets you create different workflows for different order conditions.',
            },
          },
        },
      },
    },
  },
} satisfies BaseTranslation;

export default en;
