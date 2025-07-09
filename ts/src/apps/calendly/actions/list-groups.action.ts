import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyOrganizationDefaultValue } from '../helpers/get-organization-default-value';

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
  organization: {
    type: 'string',
    required: true,
    get_default_value: getCalendlyOrganizationDefaultValue,
  },
} satisfies TQoreOptions;

const listGroups = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'list_groups',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['organization'],
      ErrorClass: CalendlyError,
    });

    const count = obj?.count || 20;
    const page_token = obj?.page_token;

    try {
      const params = {
        count: count.toString(),
        organization,
        ...(page_token && { page_token }),
      };

      return await fetchCalendlyData({
        token,
        params,
        path: 'groups',
      });
    } catch (error) {
      throw new CalendlyError(`Failed to list groups: ${error}`);
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
              organization: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
              member_count: { type: 'number' },
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

export default listGroups;
