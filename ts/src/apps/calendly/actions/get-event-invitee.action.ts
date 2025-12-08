import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyEventIdAllowedValues } from '../helpers/get-event-id-allowed-values';
import { getCalendlyEventInviteeIdAllowedValues } from '../helpers/get-event-invitee-allowed-values';

const options = {
  event_id: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyEventIdAllowedValues,
  },
  invitee: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyEventInviteeIdAllowedValues,
  },
} satisfies TQoreOptions;

const getEventInvitee = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'get_event_invitee',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, invitee, event_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['invitee', 'event_id'],
      ErrorClass: CalendlyError,
    });

    try {
      const response = await fetchCalendlyData<{ resource: Record<string, any> }>({
        token,
        path: `scheduled_events/${event_id}/invitees/${invitee}`,
      });

      return response.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to get event invitee: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      cancel_url: { type: 'string' },
      created_at: { type: 'string' },
      email: { type: 'string' },
      rescheduled: { type: 'bool' },
      reschedule_url: { type: 'string' },
      event: { type: 'string' },
      name: { type: 'string' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      new_invitee: { type: 'string' },
      old_invitee: { type: 'string' },
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
});

export default getEventInvitee;
