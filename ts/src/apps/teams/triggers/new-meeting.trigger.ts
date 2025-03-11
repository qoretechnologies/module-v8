import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { TEAMS_APP_NAME } from '../constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { Event } from '@microsoft/microsoft-graph-types';
import { TeamsMeetingSourceOption } from './constants';

const options = {
  meetingSource: TeamsMeetingSourceOption,
} satisfies TQoreOptions;

const additionalOptions = {
  teamId: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const TeamsNewMeetingTrigger = QoreAppCreator.createLocalizedTrigger<
  typeof options & Partial<typeof additionalOptions>
>({
  app: TEAMS_APP_NAME,
  action: 'new-meeting',
  options,
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const meetingSource = context.opts?.meetingSource || 'personal';
    const teamId = context.opts?.teamId;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (meetingSource === 'team' && !teamId) {
      missingValues.push('teamId');
    }

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the Teams new meeting trigger`
      );
    }

    const getItems = () => {
      return getTeamsMeetings(token!, meetingSource, teamId);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'teams_new_meeting',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const meetingSource = context.opts?.meetingSource || 'personal';
    const teamId = context.opts?.teamId;

    if (!token) {
      throw new Error('The token is required to get the new meeting example data');
    }

    if (meetingSource === 'team' && !teamId) {
      throw new Error('teamId is required when monitoring team meetings');
    }

    const meetings = await getTeamsMeetings(token, meetingSource, teamId);

    return meetings?.length > 0 ? meetings[0] : null;
  },
  event_info: {
    desc: 'Teams New Meeting Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdDateTime: { type: 'string' },
        lastModifiedDateTime: { type: 'string' },
        subject: { type: 'string' },
        bodyPreview: { type: 'string' },
        body: {
          type: {
            type: 'hash',
            fields: {
              contentType: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
        start: {
          type: {
            type: 'hash',
            fields: {
              dateTime: { type: 'string' },
              timeZone: { type: 'string' },
            },
          },
        },
        end: {
          type: {
            type: 'hash',
            fields: {
              dateTime: { type: 'string' },
              timeZone: { type: 'string' },
            },
          },
        },
        location: {
          type: {
            type: 'hash',
            fields: {
              displayName: { type: 'string' },
              locationType: { type: 'string' },
              uniqueId: { type: 'string' },
              uniqueIdType: { type: 'string' },
            },
          },
        },
        attendees: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                type: { type: 'string' },
                status: {
                  type: {
                    type: 'hash',
                    fields: {
                      response: { type: 'string' },
                      time: { type: 'string' },
                    },
                  },
                },
                emailAddress: {
                  type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      address: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        organizer: {
          type: {
            type: 'hash',
            fields: {
              emailAddress: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        onlineMeeting: {
          type: {
            type: 'hash',
            fields: {
              joinUrl: { type: 'string' },
            },
          },
        },
        isOnlineMeeting: { type: 'boolean' },
        isCancelled: { type: 'boolean' },
        source: { type: 'string' },
        teamName: { type: 'string', required: false },
      },
    },
  },
});

const getTeamsMeetings = async (
  token: string,
  meetingSource: string = 'personal',
  teamId?: string
) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token),
    },
  });

  try {
    let apiRequest;
    let teamName: string = '';

    if (meetingSource === 'team' && teamId) {
      try {
        const teamInfo = await client.api(`/teams/${teamId}`).get();
        teamName = teamInfo.displayName || '';
      } catch (teamError) {
        console.error(`Could not fetch team name: ${teamError.message}`);
      }
    }

    switch (meetingSource) {
      case 'personal':
        apiRequest = client.api('/me/events');
        break;
      case 'team':
        apiRequest = client.api(`/groups/${teamId}/events`);
        break;
      default:
        apiRequest = client.api('/me/events');
    }

    const response: PageCollection = await apiRequest
      .select(
        [
          'id',
          'createdDateTime',
          'lastModifiedDateTime',
          'subject',
          'bodyPreview',
          'body',
          'start',
          'end',
          'location',
          'attendees',
          'organizer',
          'onlineMeeting',
          'isOnlineMeeting',
          'isCancelled',
        ].join(',')
      )
      .filter('isOnlineMeeting eq true')
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .orderby('createdDateTime desc')
      .get();

    const meetings = response.value as Event[];

    return meetings.map((meeting) => ({
      ...meeting,
      source: meetingSource,
      ...(teamName ? { teamName } : {}),
    }));
  } catch (error) {
    throw new Error(`Failed to fetch Teams meetings: ${error.message}`);
  }
};

export default TeamsNewMeetingTrigger;
