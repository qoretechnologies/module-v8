import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOOM_APP_NAME, ZoomEndpointData, ZoomError } from '../constants';

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

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = (lastPoll: Date) => {
      lastPollTime = lastPoll.toISOString();
    };

    const getItems = () => {
      return fetchLatestMeetingSummaries(token, lastPollTime);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'zoom_new_meeting_summary',
      uniqueField: 'meeting_id',
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

const fetchLatestMeetingSummaries = async (token: string, from?: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const response = await QorusRequest.get<{
      data: { summaries: ZoomMeetingSummary[] };
    }>(
      {
        path: `/meetings/meeting_summaries`,
        params: {
          page_size: limit.toString(),
          ...(from && { from }),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      ZoomEndpointData
    );

    const summaries = response?.data?.summaries || [];

    if (summaries.length === 0) {
      return [];
    }

    return summaries;
  } catch (error) {
    throw new ZoomError(`Failed to fetch latest meeting summaries: ${error.message || error}`);
  }
};
