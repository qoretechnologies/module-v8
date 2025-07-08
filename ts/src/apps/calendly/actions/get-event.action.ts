import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyEventIdAllowedValues } from '../helpers/get-event-id-allowed-values';

const options = {
  event_id: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyEventIdAllowedValues,
  },
} satisfies TQoreOptions;

const getEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'get_event',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, event_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['event_id'],
      ErrorClass: CalendlyError,
    });

    try {
      const response = await fetchCalendlyData<{ resource: Record<string, any> }>({
        token,
        path: `scheduled_events/${event_id}`,
      });

      return response.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to get event: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      uri: { type: 'string' },
      name: { type: 'string' },
      meeting_notes_plain: { type: 'string' },
      meeting_notes_html: { type: 'string' },
      status: { type: 'string' },
      booking_method: { type: 'string' },
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
});

export default getEvent;
