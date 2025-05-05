import axios from 'axios';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { getAttioAttributesAsQoreOptions } from '../helpers/get-object-properties';
import { getAttioObjectRecordIdAllowedValues } from '../helpers/get-object-record-id-allowed-values';

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
    const token = context?.conn_opts?.token;
    const object = obj?.object;
    const attributes = obj?.attributes;
    const recordId = obj?.record_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!object) missingValues.push('object');
    if (!recordId) missingValues.push('record_id');
    if (!attributes) missingValues.push('attributes');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await axios.patch(
        `${ATTIO_APP_API_URL}/v2/objects/${object}/records/${recordId}`,
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
});

export default updateAttioObjectRecord;
