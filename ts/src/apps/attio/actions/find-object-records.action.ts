import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { getAttioObjectAttributesAllowedValues } from '../helpers/get-object-attribute-allowed-values';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  object: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
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
    get_allowed_values: getAttioObjectAttributesAllowedValues,
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
          get_allowed_values: getAttioObjectAttributesAllowedValues,
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const findAttioObjectRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'find_object_records',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const token = context?.conn_opts?.token;
    const object = obj?.object;
    const filter = obj?.filter as { attribute: string; value: string } | undefined;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!object) missingValues.push('object');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await QorusRequest.post<{ data: any }>(
        {
          path: `/v2/objects/${object}/records/query`,
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

      return formatAttioResponse(response?.data, 'objects', object!, token!);
    } catch (error) {
      throw new AttioError(`Failed to find object records: ${error}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    if (!context) throw new AttioError('Context is required to get dynamic response type');

    const { object, token } = getQoreContextRequiredValues({
      context,
      optionFields: ['object'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    const record = await getAttioResponseType({
      object,
      token,
    });

    return {
      type: 'list',
      element_type: record as TQoreTypeObject,
    };
  },
});

export default findAttioObjectRecords;
