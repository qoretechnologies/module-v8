import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CALENDLY_APP_NAME, CalendlyError } from '../constants';
import { fetchCalendlyData } from '../helpers/constants';
import { getCalendlyGroupIdAllowedValues } from '../helpers/get-group-allowed-values';

const options = {
  group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getCalendlyGroupIdAllowedValues,
  },
} satisfies TQoreOptions;

const getGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CALENDLY_APP_NAME,
  action: 'get_group',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, group_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['group_id'],
      ErrorClass: CalendlyError,
    });

    try {
      const response = await fetchCalendlyData<{ resource: Record<string, any> }>({
        token,
        path: `groups/${group_id}`,
      });

      return response.resource;
    } catch (error) {
      throw new CalendlyError(`Failed to get group: ${error}`);
    }
  },
  response_type: {
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
});

export default getGroup;
