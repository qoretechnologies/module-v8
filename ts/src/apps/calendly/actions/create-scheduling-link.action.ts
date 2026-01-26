import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { getCalendlyEventTypeAllowedValues } from '../helpers/get-event-type-allowed-values';

const options = {
  max_event_count: {
    type: 'number',
    required: false,
    default_value: 1,
  },
  event_type: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyEventTypeAllowedValues,
  },
} satisfies TQoreOptions;

const createSchedulingLink = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'create_scheduling_link',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, event_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['event_type'],
      ErrorClass: CalendlyError,
    });

    const max_event_count = obj?.max_event_count || 1;

    try {
      const response = await QorusRequest.post<{ data: { resource: Record<string, any> } }>(
        {
          path: `/scheduling_links`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            max_event_count,
            owner: event_type,
            owner_type: 'EventType',
          },
        },
        {
          url: 'https://api.calendly.com',
          endpointId: CALENDLY_APP_NAME,
        }
      );

      return response?.data?.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to create scheduling link: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      booking_url: { type: 'string' },
      owner: { type: 'string' },
      owner_type: { type: 'string' },
    },
  },
});

export default createSchedulingLink;
