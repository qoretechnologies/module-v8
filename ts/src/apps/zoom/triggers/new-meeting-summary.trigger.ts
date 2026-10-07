import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOOM_APP_NAME, ZOOM_TRIGGER_KEY_VERSION, ZoomEndpointData, ZoomError } from '../constants';
import { toZoomDateTime } from '../helpers/dates';

type ZoomMeetingSummary = {
  meeting_end_time: string;
  meeting_host_email: string;
  meeting_host_id: string;
  meeting_id: number;
  meeting_start_time: string;
  meeting_topic: string;
  meeting_uuid: string;
  summary_created_time: string;
  summary_end_time: string;
  summary_last_modified_time: string;
  summary_start_time: string;
};

/**
 * The body of `GET /users/{userId}/meeting_summaries`. On an account without the feature Zoom answers
 * with a 200 that carries only `code` and `message` ("Only available for Paid account.").
 */
type ZoomMeetingSummariesResponse = {
  summaries?: ZoomMeetingSummary[];
  next_page_token?: string;
  code?: number;
  message?: string;
};

/**
 * How far back of the last poll `from` reaches.
 *
 * The listing is filtered by the time Zoom created each summary, and the last poll time is taken once a
 * cycle has finished, so a summary created while the previous cycle was running, or indexed late by Zoom,
 * would otherwise fall between two polls for good. A summary the window lists twice is delivered once:
 * the trigger dedupes on the meeting instance's UUID.
 */
const SUMMARIES_FROM_LOOKBACK_MS = 60 * 60 * 1000;

const ZoomNewMeetingSummaryTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZOOM_APP_NAME,
  action: 'new_meeting_summary',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ZoomError,
    });

    let lastPollTime = new Date();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll;
    };

    const getItems = () => {
      return fetchLatestMeetingSummaries(token, lastPollTime);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'zoom_new_meeting_summary',
      // every instance of a recurring or personal-meeting-room meeting gets its own summary, and all of
      // them share `meeting_id`: the instance's UUID tells them apart
      uniqueField: 'meeting_uuid',
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

    const summaries = await fetchLatestMeetingSummaries(token);

    return summaries?.length > 0 ? summaries[0] : null;
  },
  event_info: {
    desc: 'Zoom New Meeting Summary Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        meeting_id: {
          type: 'number',
        },
        meeting_uuid: {
          type: 'string',
        },
        meeting_host_id: {
          type: 'string',
        },
        meeting_host_email: {
          type: 'string',
        },
        meeting_topic: {
          type: 'string',
        },
        meeting_start_time: {
          type: 'string',
        },
        meeting_end_time: {
          type: 'string',
        },
        summary_created_time: {
          type: 'string',
        },
        summary_start_time: {
          type: 'string',
        },
        summary_end_time: {
          type: 'string',
        },
        summary_last_modified_time: {
          type: 'string',
        },
      },
    },
  },
});

export default ZoomNewMeetingSummaryTrigger;

/**
 * Lists the user's meeting summaries, newest first.
 *
 * @param token - the connection's access token.
 * @param from - the time of the last poll; the request lists the summaries created from an hour before
 * it, see {@link SUMMARIES_FROM_LOOKBACK_MS}. Without it the latest summaries are listed.
 */
const fetchLatestMeetingSummaries = async (token: string, from?: Date) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  let response: { data?: ZoomMeetingSummariesResponse } | undefined;

  try {
    response = await QorusRequest.get<{ data: ZoomMeetingSummariesResponse }>(
      {
        // the user's own summaries: `/meetings/meeting_summaries` lists the whole account's and needs an
        // admin scope, which a user-managed app cannot hold
        path: `/users/me/meeting_summaries`,
        params: {
          page_size: limit.toString(),
          ...(from && {
            from: toZoomDateTime(new Date(from.getTime() - SUMMARIES_FROM_LOOKBACK_MS)),
            time_filter_field: 'summary_created_time',
          }),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      ZoomEndpointData
    );
  } catch (error) {
    throw new ZoomError(`Failed to fetch latest meeting summaries: ${error.message || error}`);
  }

  const summaries = response?.data?.summaries;

  if (!Array.isArray(summaries)) {
    const message = response?.data?.message;

    if (typeof message === 'string' && message) {
      // say what Zoom said rather than report an empty feed: the account has no summaries to list
      throw new ZoomError(`Zoom did not list the meeting summaries: ${message}`);
    }

    return [];
  }

  return summaries;
};
