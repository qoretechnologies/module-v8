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
  count: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  page_token: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        direction: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: [
            {
              value: 'asc',
              display_name: 'Ascending',
            },
            {
              value: 'desc',
              display_name: 'Descending',
            },
          ],
        },
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: [
            {
              value: 'created_at',
              display_name: 'Created At',
            },
          ],
        },
      },
    },
  },

  status: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'active', display_name: 'Active' },
      { value: 'canceled', display_name: 'Canceled' },
    ],
  },
} satisfies TQoreOptions;

const listEventInvitees = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'list_event_invitees',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, event_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['event_id'],
      ErrorClass: CalendlyError,
    });

    const count = obj?.count || 20;
    const page_token = obj?.page_token;
    const sort = obj?.sort;
    const email = obj?.email;
    const status = obj?.status;

    try {
      const params = {
        count: count.toString(),
        ...(sort && { sort: `${sort.field}:${sort.direction}` }),
        ...(page_token && { page_token }),
        ...(email && { email }),
        ...(status && { status }),
      };

      return await fetchCalendlyData({
        token,
        params,
        path: `scheduled_events/${event_id}/invitees`,
      });
    } catch (error) {
      throw new CalendlyError(`Failed to list events: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      collection: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              cancel_url: { type: 'string' },
              created_at: { type: 'string' },
              email: { type: 'string' },
              event: { type: 'string' },
              name: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              new_invitee: { type: 'string' },
              old_invitee: { type: 'string' },
              questions_and_answers: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      answer: { type: 'string' },
                      position: { type: 'number' },
                      question: { type: 'string' },
                    },
                  },
                },
              },
              reschedule_url: { type: 'string' },
              rescheduled: { type: 'bool' },
              status: { type: 'string' },
              text_reminder_number: { type: 'string' },
              timezone: { type: 'string' },
              tracking: {
                type: {
                  type: 'hash',
                  fields: {
                    utm_campaign: { type: 'string' },
                    utm_source: { type: 'string' },
                    utm_medium: { type: 'string' },
                    utm_content: { type: 'string' },
                    utm_term: { type: 'string' },
                    salesforce_uuid: { type: 'string' },
                  },
                },
              },
              updated_at: { type: 'string' },
              uri: { type: 'string' },
              routing_form_submission: { type: 'string' },
              payment: {
                type: {
                  type: 'hash',
                  fields: {
                    external_id: { type: 'string' },
                    provider: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    terms: { type: 'string' },
                    successful: { type: 'bool' },
                  },
                },
              },
              no_show: { type: 'string' },
              reconfirmation: {
                type: {
                  type: 'hash',
                  fields: {
                    created_at: { type: 'string' },
                    confirmed_at: { type: 'string' },
                  },
                },
              },
              scheduling_method: { type: 'string' },
              invitee_scheduled_by: { type: 'string' },
            },
          },
        },
      },
      pagination: {
        type: {
          type: 'hash',
          fields: {
            count: { type: 'number' },
            next_page: { type: 'string' },
            previous_page: { type: 'string' },
            next_page_token: { type: 'string' },
            previous_page_token: { type: 'string' },
          },
        },
      },
    },
  },
});

export default listEventInvitees;
