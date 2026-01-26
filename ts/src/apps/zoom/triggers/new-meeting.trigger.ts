import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOOM_APP_NAME, ZoomEndpointData, ZoomError } from '../constants';

type ZoomMeeting = {
  agenda: string;
  created_at: string;
  duration: number;
  host_id: string;
  id: number;
  join_url: string;
  pmi: string;
  start_time: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
};

const meetingTypeNames: Record<number, string> = {
  1: 'Instant Meeting',
  2: 'Scheduled Meeting',
  3: 'Recurring Meeting with no fixed time',
  8: 'Recurring Meeting with fixed time',
};

const ZoomNewMeetingTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZOOM_APP_NAME,
  action: 'new_meeting',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    meeting_event_type: {
      type: 'string',
      required: true,
      default_value: 'upcoming',
      allowed_values: [
        {
          value: 'upcoming',
          display_name: 'Triggers when a meeting is created',
        },
        {
          value: 'previous_meetings',
          display_name: 'Triggers when a meeting is ended',
        },
        {
          value: 'live',
          display_name: 'Triggers when a meeting is started',
        },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, meeting_event_type } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['meeting_event_type'],
      ErrorClass: ZoomError,
    });

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const getItems = () => {
      return fetchLatestMeetings({
        token,
        from: lastPollTime,
        meeting_event_type,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'zoom_new_meeting',
      uniqueField: 'id',
      getItems,
      update,
      updateLastPollTime,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ZoomError,
    });

    const meetings = await fetchLatestMeetings({
      token,
    });

    return meetings?.length > 0 ? meetings[0] : null;
  },
  event_info: {
    desc: 'Zoom New Meeting Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'number',
        },
        uuid: {
          type: 'string',
        },
        host_id: {
          type: 'string',
        },
        topic: {
          type: 'string',
        },
        agenda: {
          type: 'string',
        },
        type: {
          type: 'number',
        },
        start_time: {
          type: 'string',
        },
        duration: {
          type: 'number',
        },
        timezone: {
          type: 'string',
        },
        created_at: {
          type: 'string',
        },
        join_url: {
          type: 'string',
        },
        pmi: {
          type: 'string',
        },
        meeting_type_name: {
          type: 'string',
        },
      },
    },
  },
});

export default ZoomNewMeetingTrigger;

const fetchLatestMeetings = async (options: {
  token: string;
  from?: string;
  meeting_event_type?: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const response = await QorusRequest.get<{ data: { meetings: ZoomMeeting[] } }>(
      {
        path: `/users/me/meetings`,
        params: {
          page_size: limit.toString(),
          ...(options.from && { from: options.from }),
          ...(options.meeting_event_type && { type: options.meeting_event_type }),
        },
        headers: {
          Authorization: `Bearer ${options.token}`,
        },
      },
      ZoomEndpointData
    );

    const meetings = response?.data?.meetings || [];

    if (meetings.length === 0) {
      return [];
    }

    return meetings.map((meeting: ZoomMeeting) => {
      return {
        ...meeting,
        meeting_type_name: meetingTypeNames[meeting.type] || 'Unknown Meeting Type',
      };
    });
  } catch (error) {
    throw new ZoomError(`Failed to fetch latest meetings: ${error.message || error}`);
  }
};
