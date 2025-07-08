import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyOrganizationDefaultValue } from '../helpers/get-organization-default-value';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';

const CalendlyEventCanceledTrigger = QoreAppCreator.createLocalizedTrigger({
  app: CALENDLY_APP_NAME,
  action: 'event_canceled',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const organization = await getCalendlyOrganizationDefaultValue(context);

    const getItems = () => {
      return fetchLatestEvents({ organization, token, canceledOnly: true });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'calendly_event_canceled',
      uniqueField: 'uri',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const organization = await getCalendlyOrganizationDefaultValue(context);

    const events = await fetchLatestEvents({ organization, token, canceledOnly: false });

    return events?.length > 0 ? events[0] : null;
  },
  event_info: {
    desc: 'Calendly Event Canceled Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        uri: { type: 'string' },
        name: { type: 'string' },
        meeting_notes_plain: { type: 'string' },
        meeting_notes_html: { type: 'string' },
        status: { type: 'string' },
        start_time: { type: 'string' },
        end_time: { type: 'string' },
        event_type: { type: 'string' },
        location: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              location: { type: 'string' },
              additional_info: { type: 'string' },
            },
          },
        },
        invitees_counter: {
          type: {
            type: 'hash',
            fields: {
              total: { type: 'number' },
              active: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
        event_memberships: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                user: { type: 'string' },
                user_email: { type: 'string' },
                user_name: { type: 'string' },
                buffered_end_time: { type: 'string' },
                buffered_start_time: { type: 'string' },
              },
            },
          },
        },
        event_guests: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                email: { type: 'string' },
                created_at: { type: 'string' },
                updated_at: { type: 'string' },
              },
            },
          },
        },
        calendar_event: {
          type: {
            type: 'hash',
            fields: {
              kind: { type: 'string' },
              external_id: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default CalendlyEventCanceledTrigger;

const fetchLatestEvents = async (options: {
  token: string;
  canceledOnly: boolean;
  organization: string;
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, canceledOnly, organization } = options;

  try {
    const response = await fetchCalendlyData<{ collection: Array<Record<string, any>> }>({
      token,
      params: {
        count: limit.toString(),
        sort: 'start_time:desc',
        organization,
        ...(canceledOnly && { status: 'canceled' }),
      },
      path: `scheduled_events`,
    });

    return response.collection;
  } catch (error) {
    throw new CalendlyError(`Failed to fetch latest events: ${error}`);
  }
};
