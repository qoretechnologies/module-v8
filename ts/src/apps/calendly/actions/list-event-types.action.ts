import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyOrganizationDefaultValue } from '../helpers/get-organization-default-value';
import { getCalendlyOrganizationMemberAllowedValues } from '../helpers/get-user-organization-member-allowed-values';

const options = {
  count: {
    type: 'number',
    required: false,
    default_value: 20,
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
            { value: 'name', display_name: 'Name' },
            { value: 'position', display_name: 'Position' },
            { value: 'created_at', display_name: 'Created At' },
            { value: 'updated_at', display_name: 'Updated At' },
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
  admin_managed: {
    type: 'boolean',
    required: false,
  },
  active: {
    type: 'boolean',
    required: false,
  },
  user_availability_schedule: {
    type: 'string',
    required: false,
    get_allowed_values: getCalendlyOrganizationMemberAllowedValues,
  },
} satisfies TQoreOptions;

const listEventTypes = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'list_event_types',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: CalendlyError,
    });

    const count = obj?.count || 20;
    const page_token = obj?.page_token;
    const sort = obj?.sort;
    let organization = obj?.organization;
    const user = obj?.user;
    const admin_managed = obj?.admin_managed;
    const active = obj?.active;
    const user_availability_schedule = obj?.user_availability_schedule;

    if (!organization && !user) {
      organization = await getCalendlyOrganizationDefaultValue(context);
    }

    try {
      const params = {
        count: count.toString(),
        ...(user_availability_schedule && { user_availability_schedule }),
        ...(admin_managed && { admin_managed: admin_managed.toString() }),
        ...(active && { active: active.toString() }),
        ...(page_token && { page_token }),
        ...(sort && { sort: `${sort.field}:${sort.direction}` }),
        ...(organization && { organization }),
        ...(user && { user }),
      };

      return await fetchCalendlyData({
        token,
        params,
        path: 'event_types',
      });
    } catch (error) {
      throw new CalendlyError(`Failed to list event types: ${error}`);
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

export default listEventTypes;
