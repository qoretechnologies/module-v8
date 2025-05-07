import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { getAttioAttributesAsQoreOptions } from '../helpers/get-object-properties';
import { getAttioObjectRecordIdAllowedValues } from '../helpers/get-object-record-id-allowed-values';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  object: {
    display_name: 'Object',
    required: true,
    type: 'string',
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
    on_change: ['refetch'],
    get_dependent_options: async (context) => {
      const object = context?.opts?.object;
      const token = context?.conn_opts?.token;

      if (!object)
        return {
          attributes: {
            required: true,
            type: 'hash',
          },
        };

      const attributes = await getAttioAttributesAsQoreOptions('objects', object, token!);

      return {
        attributes: {
          required: true,
          type: {
            type: 'hash',
            fields: attributes,
          },
        },
      };
    },
  },
  record_id: {
    required: true,
    type: 'string',
    get_allowed_values: getAttioObjectRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  attributes: {
    type: 'hash',
    required: true,
  },
} satisfies TQoreOptions;

const updateAttioObjectRecord = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: ATTIO_APP_NAME,
  action: 'update_object_record',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { attributes, object, record_id, token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['object', 'record_id', 'attributes'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await axios.patch(
        `${ATTIO_APP_API_URL}/v2/objects/${object}/records/${record_id}`,
        {
          data: {
            values: attributes,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return formatAttioResponse(response?.data, 'objects', object!, token!);
    } catch (error) {
      throw new AttioError(`Failed to update object record: ${error}`);
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

    return await getAttioResponseType({
      object,
      token,
    });
  },
});

export default updateAttioObjectRecord;
