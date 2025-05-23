import { BaseTranslation } from '../../../i18n-types';

const GoogleMeetAppEn = {
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
          longDesc: 'Filter results to only include conferences with the specified meeting code.',
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
    get_conference: {
      displayName: 'Get Conference',
      shortDesc: 'Retrieve detailed information about a Google Meet conference.',
      longDesc:
        'Fetches comprehensive details about a specific Google Meet conference including basic information, recordings, participants, and transcripts. Returns all related data in a single response.',
      options: {
        conference: {
          displayName: 'Conference',
          shortDesc: 'The conference to retrieve',
          longDesc:
            'The conference ID or meeting code of the Google Meet conference to retrieve detailed information for.',
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
} satisfies BaseTranslation;

export default GoogleMeetAppEn;
