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
  reason: {
    type: 'string',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const cancelEvent = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'cancel_event',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, event_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['event_id'],
      ErrorClass: CalendlyError,
    });

    const reason = obj?.reason;

    try {
      const response = await fetchCalendlyData<{ resource: Record<string, any> }>({
        token,
        path: `scheduled_events/${event_id}/cancellation`,
        method: 'POST',
        ...(reason && { body: { reason } }),
      });

      return response.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to cancel event: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      canceled_by: { type: 'string' },
      reason: { type: 'string' },
      canceler_type: { type: 'string' },
      created_at: { type: 'string' },
    },
  },
});

export default cancelEvent;
