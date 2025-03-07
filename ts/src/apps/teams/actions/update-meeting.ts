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
  meetingId: {
    type: 'string',
    required: true,
  },
  subject: {
    type: 'string',
    required: false,
  },
  startDateTime: {
    type: 'date',
    required: false,
  },
  endDateTime: {
    type: 'date',
    required: false,
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
  },
  timeZone: {
    type: 'string',
    required: false,
    get_allowed_values: getOutlookTimezonesAllowedValues,
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

export const UpdateTeamsMeeting = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'update-meeting',
  app: TEAMS_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const meetingId = data?.meetingId;
    const subject = data?.subject;
    const startDateTime = data?.startDateTime;
    const endDateTime = data?.endDateTime;
    const teamId = data?.teamId;
    const channelId = data?.channelId;
    const content = data?.content;
    const location = data?.location;
    const attendees = data?.attendees as string[] | undefined;
    const isOnlineMeeting = data?.isOnlineMeeting;
    const timeZone = data?.timeZone;

    const missingValues: string[] = [];
    if (!token) missingValues.push('token');
    if (!meetingId) missingValues.push('meetingId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to update Teams meeting`
      );
    }

    if (startDateTime && endDateTime) {
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format for startDateTime or endDateTime');
      }

      if (startDate >= endDate) {
        throw new Error('End time must be after start time');
      }
    } else if ((startDateTime && !endDateTime) || (!startDateTime && endDateTime)) {
      throw new Error('Both startDateTime and endDateTime must be provided together');
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
      const meetingBody: any = {};

      if (subject) {
        meetingBody.subject = subject;
      }

      if (startDateTime && endDateTime) {
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        meetingBody.start = {
          dateTime: startDate.toISOString(),
          timeZone: timeZone || 'UTC',
        };

        meetingBody.end = {
          dateTime: endDate.toISOString(),
          timeZone: timeZone || 'UTC',
        };
      }

      if (content !== undefined) {
        meetingBody.body = {
          contentType: 'html',
          content,
        };
      }

      if (location !== undefined) {
        meetingBody.location = {
          displayName: location,
        };
      }

      if (isOnlineMeeting !== undefined) {
        meetingBody.isOnlineMeeting = isOnlineMeeting;
      }

      if (attendees) {
        const attendeesList = attendees.map((email: string) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        }));

        meetingBody.attendees = attendeesList;
      }

      if (Object.keys(meetingBody).length === 0) {
        throw new Error('No updates provided');
      }

      let response;
      if (teamId && channelId) {
        response = await client
          .api(`/teams/${teamId}/channels/${channelId}/calendar/events/${meetingId}`)
          .patch(meetingBody);
      } else {
        response = await client.api(`/me/events/${meetingId}`).patch(meetingBody);
      }

      return {
        id: response.id || meetingId,
        subject: response.subject || subject || '',
        onlineMeeting: {
          joinUrl: response.onlineMeeting?.joinUrl || '',
        },
        success: true,
        error: '',
      };
    } catch (error) {
      throw new Error(`Failed to update Teams meeting: ${error.message}`);
    }
  },
  options,
  response_type,
});
