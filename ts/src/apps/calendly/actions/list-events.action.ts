import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getCalendlyOrganizationMemberAllowedValues } from '../helpers/get-user-organization-member-allowed-values';
import { getCalendlyOrganizationDefaultValue } from '../helpers/get-organization-default-value';

const options = {
  count: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  group: {
    type: 'string',
    required: false,
    get_allowed_values: getCalendlyGroupAllowedValues,
  },
  invitee_email: {
    type: 'string',
    required: false,
  },
  max_start_time: {
    type: 'date',
    required: false,
  },
  min_start_time: {
    type: 'date',
    required: false,
  },
  page_token: {
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
              value: 'start_time',
              display_name: 'Start Time',
            },
            {
              value: 'end_time',
              display_name: 'End Time',
            },
          ],
        },
      },
    },
  },
  organization: {
    type: 'string',
    required: false,
    get_default_value: getCalendlyOrganizationDefaultValue,
  },
  user: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getCalendlyOrganizationMemberAllowedValues,
  },
} satisfies TQoreOptions;

const listEvents = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'list_events',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const count = obj?.count || 20;
    const group = obj?.group;
    const invitee_email = obj?.invitee_email;
    const max_start_time = obj?.max_start_time;
    const min_start_time = obj?.min_start_time;
    const page_token = obj?.page_token;
    const sort = obj?.sort;
    let organization = obj?.organization;
    const user = obj?.user;

    if (!group && !organization && !user) {
      organization = await getCalendlyOrganizationDefaultValue(context);
    }

    try {
      const params = {
        count: count.toString(),
        ...(group && { group }),
        ...(invitee_email && { invitee_email }),
        ...(max_start_time && { max_start_time }),
        ...(min_start_time && { min_start_time }),
        ...(page_token && { page_token }),
        ...(sort && { sort: `${sort.field}:${sort.direction}` }),
        ...(organization && { organization }),
        ...(user && { user }),
      };

      return await fetchCalendlyData({
        token,
        params,
        path: 'scheduled_events',
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
      },
      pagination: {
        type: {
          type: 'hash',
          fields: {
            count: { type: 'number' },
            next_page: { type: 'string', required: false },
            previous_page: { type: 'string', required: false },
            next_page_token: { type: 'string', required: false },
            previous_page_token: { type: 'string', required: false },
          },
        },
      },
    },
  },
});

export default listEvents;
