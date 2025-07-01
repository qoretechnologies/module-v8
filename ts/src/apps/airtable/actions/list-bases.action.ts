import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';

type Base = {
  id: string;
  name: string;
  permissionLevel: string;
};

const options = {
  offset: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listBases = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AIRTABLE_APP_NAME,
  action: 'list_bases',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: AirtableError,
    });

    try {
      const response = await QorusRequest.get<{ data: { bases: Base[] } }>(
        {
          path: '/v0/meta/bases',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        {
          url: 'https://api.airtable.com',
          endpointId: AIRTABLE_APP_NAME,
        }
      );

      return response?.data || { bases: [], offset: null };
    } catch (error) {
      throw new AirtableError(`Failed to list bases: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      offset: { type: 'string' },
      bases: {
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

export default listBases;
