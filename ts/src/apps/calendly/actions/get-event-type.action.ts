import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyEventTypeIdAllowedValues } from '../helpers/get-event-type-allowed-values';

const options = {
  event_type_id: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyEventTypeIdAllowedValues,
  },
} satisfies TQoreOptions;

const getEventType = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'get_event_type',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, event_type_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['event_type_id'],
      ErrorClass: CalendlyError,
    });

    try {
      const response = await fetchCalendlyData<{ resource: Record<string, any> }>({
        token,
        path: `event_types/${event_type_id}`,
      });

      return response.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to get event type: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      uri: { type: 'string' },
      name: { type: 'string' },
      active: { type: 'boolean' },
      booking_method: { type: 'string' },
      slug: { type: 'string' },
      scheduling_url: { type: 'string' },
      duration: { type: 'number' },
      duration_options: {
        type: {
          type: 'list',
          element_type: 'number',
        },
      },
      kind: { type: 'string' },
      pooling_type: { type: 'string' },
      type: { type: 'string' },
      color: { type: 'string' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
      internal_note: { type: 'string' },
      description_plain: { type: 'string' },
      description_html: { type: 'string' },
      profile: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            name: { type: 'string' },
            owner: { type: 'string' },
          },
        },
      },
      secret: { type: 'boolean' },
      deleted_at: { type: 'string' },
      admin_managed: { type: 'boolean' },
      locations: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              kind: { type: 'string' },
              phone_number: { type: 'string' },
              additional_info: { type: 'string' },
            },
          },
        },
      },
      position: { type: 'number' },
      custom_questions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              type: { type: 'string' },
              position: { type: 'number' },
              enabled: { type: 'boolean' },
              required: { type: 'boolean' },
              answer_choices: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              include_other: { type: 'boolean' },
            },
          },
        },
      },
      locale: { type: 'string' },
    },
  },
});

export default getEventType;
