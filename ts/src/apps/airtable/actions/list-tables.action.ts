import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { getAirtableBaseIdAllowedValues } from '../helpers/get-base-id-allowed-values';

type Table = {
  id: string;
  name: string;
};

const options = {
  base_id: {
    type: 'string',
    required: true,
    get_allowed_values: getAirtableBaseIdAllowedValues,
  },
} satisfies TQoreOptions;

const listTables = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'list_tables',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, base_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['base_id'],
      ErrorClass: AirtableError,
    });

    try {
      const response = await QorusRequest.get<{ data: { tables: Table[] } }>(
        {
          path: `/v0/meta/bases/${base_id}/tables`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          url: 'https://api.airtable.com',
          endpointId: AIRTABLE_APP_NAME,
        }
      );

      return response?.data || { tables: [] };
    } catch (error) {
      throw new AirtableError(`Failed to list tables: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      tables: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              permissionLevel: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default listTables;
