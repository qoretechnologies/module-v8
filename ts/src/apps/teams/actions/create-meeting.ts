import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTeamsChannelIdAllowedValues } from '../helpers/get-channel-id-allowed-values';
import { getTeamsAttendeesAllowedValues } from '../helpers/get-attendee-allowed-values';
import { getTeamsTeamIdAllowedValues } from '../helpers/get-team-id-allowed-values';
import { getOutlookTimezonesAllowedValues } from '../../outlook/helpers/get-timezone-allowed-values';

const options = {
  subject: {
    type: 'string',
    required: true,
  },
  startDateTime: {
    type: 'date',
    required: true,
  },
  endDateTime: {
    type: 'date',
    required: true,
  },
  teamId: {
    type: 'string',
    required: false,
    get_allowed_values: getTeamsTeamIdAllowedValues,
  },
  channelId: {
    type: 'string',
    required: false,
    depends_on: ['teamId'],
    get_allowed_values: getTeamsChannelIdAllowedValues,
  },
  content: {
    type: 'string',
    required: false,
  },
  location: {
    type: 'string',
    required: false,
  },
  attendees: {
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getTeamsAttendeesAllowedValues,
    required: false,
  },
  isOnlineMeeting: {
    type: 'boolean',
    required: false,
    default_value: true,
  },
  timeZone: {
    type: 'string',
    required: false,
    get_allowed_values: getOutlookTimezonesAllowedValues,
    default_value: 'UTC',
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    subject: {
      type: 'string',
    },
    onlineMeeting: {
      type: {
        type: 'hash',
        fields: {
          joinUrl: {
            type: 'string',
          },
        },
      },
    },
    success: {
      type: 'boolean',
    },
    error: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

const CreateTeamsMeeting = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-meeting',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const subject = data?.subject;
    const startDateTime = data?.startDateTime;
    const endDateTime = data?.endDateTime;
    const teamId = data?.teamId;
    const channelId = data?.channelId;
    const content = data?.content;
    const location = data?.location;
    const attendees = data?.attendees || [];
    const isOnlineMeeting = data?.isOnlineMeeting !== false;
    const timeZone = data?.timeZone || 'UTC';

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!subject) missingValues.push('subject');
    if (!startDateTime) missingValues.push('startDateTime');
    if (!endDateTime) missingValues.push('endDateTime');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create Teams meeting`
      );
    }

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format for startDateTime or endDateTime');
    }

    if (startDate >= endDate) {
      throw new Error('End time must be after start time');
    }

    if ((teamId && !channelId) || (!teamId && channelId)) {
      throw new Error('Both teamId and channelId must be provided for channel meetings');
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    try {
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const attendeesList = attendees.map((email: string) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      }));

      const meetingBody: any = {
        subject,
        start: {
          dateTime: startIso,
          timeZone,
        },
        end: {
          dateTime: endIso,
          timeZone,
        },
        isOnlineMeeting,
      };

      if (content) {
        meetingBody.body = {
          contentType: 'html',
          content,
        };
      }

      if (location) {
        meetingBody.location = {
          displayName: location,
        };
      }

      if (attendeesList.length > 0) {
        meetingBody.attendees = attendeesList;
      }

      let response;
      if (teamId && channelId) {
        response = await client
          .api(`/teams/${teamId}/channels/${channelId}/calendarView`)
          .post(meetingBody);
      } else {
        response = await client.api('/me/events').post(meetingBody);
      }

      return {
        id: response.id,
        subject: response.subject,
        onlineMeeting: {
          joinUrl: response.onlineMeeting?.joinUrl || '',
        },
        success: true,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to create Teams meeting: ${error.message}`);
    }
  },
  options,
  response_type,
});

export default CreateTeamsMeeting;
