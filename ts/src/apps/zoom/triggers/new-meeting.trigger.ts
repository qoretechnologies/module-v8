import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOOM_APP_NAME, ZOOM_TRIGGER_KEY_VERSION, ZoomEndpointData, ZoomError } from '../constants';
import { toZoomDate } from '../helpers/dates';

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

/**
 * How far back of the last poll `from` reaches.
 *
 * Zoom takes `from` as a calendar day; the trigger sends the day in UTC, together with `timezone=UTC` so
 * that Zoom reads it the same way. A day of slack keeps a meeting that runs across midnight, and the
 * meetings of a user whose own day is behind or ahead of UTC, from falling between two polls. A meeting
 * the window lists twice is delivered once: the trigger dedupes on its key.
 */
const MEETINGS_FROM_LOOKBACK_MS = 24 * 60 * 60 * 1000;

/**
 * The field that identifies a meeting, per event type.
 *
 * Zoom's `id` is the meeting number, which every instance of a recurring or personal-meeting-room meeting
 * shares; `uuid` identifies one instance. A meeting that starts or ends is an instance, so those event
 * types dedupe on `uuid` and every occurrence is reported. A meeting being created is the series, so that
 * one dedupes on `id`: a recurring meeting with ten occurrences is reported once, not ten times.
 */
const meetingUniqueField = (meeting_event_type: string): 'id' | 'uuid' =>
  meeting_event_type === 'upcoming' ? 'id' : 'uuid';

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

    let lastPollTime = new Date();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll;
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
      uniqueField: meetingUniqueField(meeting_event_type),
      keyVersion: ZOOM_TRIGGER_KEY_VERSION,
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
      // the event type the trigger is being set up with, when the form already has one; Zoom's own
      // default lists the meetings running right now, which is nearly always nothing
      meeting_event_type: context?.opts?.meeting_event_type || 'upcoming',
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

/**
 * Lists the user's meetings of one kind.
 *
 * @param options.token - the connection's access token.
 * @param options.from - the time of the last poll; the request lists the meetings of that day and the
 * day before, in UTC, see {@link MEETINGS_FROM_LOOKBACK_MS}. Without it the latest meetings are listed.
 * @param options.meeting_event_type - Zoom's `type` of listing: `upcoming`, `previous_meetings` or `live`.
 */
const fetchLatestMeetings = async (options: {
  token: string;
  from?: Date;
  meeting_event_type?: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const response = await QorusRequest.get<{ data: { meetings: ZoomMeeting[] } }>(
      {
        path: `/users/me/meetings`,
        params: {
          page_size: limit.toString(),
          ...(options.from && {
            from: toZoomDate(new Date(options.from.getTime() - MEETINGS_FROM_LOOKBACK_MS)),
            timezone: 'UTC',
          }),
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
