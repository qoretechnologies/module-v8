import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
  TQoreResponseType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioListAttributesAllowedValues } from '../helpers/get-attio-list-attribute-allowed-values';
import { getAttioListApiSlugAllowedValues } from '../helpers/get-list-allowed-values';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  list: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioListApiSlugAllowedValues,
  },
  limit: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  offset: {
    type: 'integer',
    default_value: 0,
    required: false,
  },
  sort_attribute: {
    type: 'string',
    default_value: 'created_at',
    allowed_values_creatable: true,
    get_allowed_values: getAttioListAttributesAllowedValues,
    required: false,
  },
  sort_direction: {
    type: 'string',
    default_value: 'asc',
    required: false,
    allowed_values: [
      {
        display_name: 'Ascending',
        value: 'asc',
      },
      {
        display_name: 'Descending',
        value: 'desc',
      },
    ],
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        attribute: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getAttioListAttributesAllowedValues,
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const findAttioListEntries = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'find_list_entries',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const token = context?.conn_opts?.token;
    const list = obj?.list;
    const filter = obj?.filter;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!list) missingValues.push('list');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await QorusRequest.post<{ data: any }>(
        {
          path: `/v2/lists/${list}/entries/query`,
          data: {
            ...(obj?.sort_attribute && {
              sorts: [
                {
                  direction: obj?.sort_direction || 'asc',
                  attribute: obj?.sort_attribute,
                },
              ],
            }),
            ...(filter?.attribute &&
              filter?.value && {
                filter: {
                  [filter?.attribute]: filter?.value,
                },
              }),
            ...(obj?.limit && {
              limit: obj?.limit,
            }),
            ...(obj?.offset && {
              offset: obj?.offset,
            }),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { url: ATTIO_APP_API_URL, endpointId: ATTIO_APP_NAME }
      );

      return formatAttioResponse(response?.data, 'objects', list!, token!);
    } catch (error) {
      throw new AttioError(`Failed to find list entries: ${error}`);
    }
  },

  get_dynamic_response_type: async (context) => {
    if (!context) throw new AttioError('Context is required to get dynamic response type');

    const { list, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['list'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    const entryType = await getAttioResponseType({
      list,
      token,
    });

    return {
      type: 'list',
      element_type: entryType as TQoreTypeObject,
    } satisfies TQoreResponseType;
  },
});

export default findAttioListEntries;
