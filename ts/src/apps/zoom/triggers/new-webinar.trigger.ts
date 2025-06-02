import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOOM_APP_NAME, ZoomEndpointData, ZoomError } from '../constants';

type ZoomWebinar = {
  agenda: string;
  created_at: string;
  duration: number;
  host_id: string;
  id: number;
  is_simulive: boolean;
  join_url: string;
  start_time: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
};

const webinarTypeNames: Record<number, string> = {
  5: 'Webinar',
  6: 'Recurring Webinar with no fixed time',
  9: 'Recurring Webinar with fixed time',
};

const ZoomNewWebinarTrigger = QoreAppCreator.createLocalizedTrigger({
  app: ZOOM_APP_NAME,
  action: 'new_webinar',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ZoomError,
    });

    const getItems = () => {
      return fetchLatestWebinars(token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'zoom_new_webinar',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: ZoomError,
    });

    const webinars = await fetchLatestWebinars(token);

    return webinars?.length > 0 ? webinars[0] : null;
  },
  event_info: {
    desc: 'Zoom New Webinar Trigger Event Info',
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
        registration_url: {
          type: 'string',
        },
        attendees_count: {
          type: 'number',
        },
        webinar_type_name: {
          type: 'string',
        },
      },
    },
  },
});

export default ZoomNewWebinarTrigger;

const fetchLatestWebinars = async (token: string) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const response = await QorusRequest.get<{ data: { webinars: ZoomWebinar[] } }>(
      {
        path: `/users/me/webinars`,
        params: {
          page_size: limit.toString(),
          type: 'upcoming',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      ZoomEndpointData
    );

    const webinars = response?.data?.webinars || [];

    if (webinars.length === 0) {
      return [];
    }

    return webinars.map((webinar: ZoomWebinar) => {
      return {
        ...webinar,
        webinar_type_name: webinarTypeNames[webinar.type] || 'Unknown Webinar Type',
      };
    });
  } catch (error) {
    throw new ZoomError(`Failed to fetch latest webinars: ${error.message || error}`);
  }
};
