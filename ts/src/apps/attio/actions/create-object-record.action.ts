import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { AttioCompanyRequiredFields, AttioPersonRequiredFields } from '../helpers/constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioAttributesAsQoreOptions } from '../helpers/get-object-properties';

const setRequiredFields = (object: string, attributes: TQoreOptions) => {
  let requiredFields: string[] = [];
  if (object === 'companies') {
    requiredFields = AttioCompanyRequiredFields;
  } else if (object === 'people') {
    requiredFields = AttioPersonRequiredFields;
  }

  requiredFields.forEach((field) => {
    if (attributes[field]) {
      attributes[field].required = true;
    }
  });

  return attributes;
};

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
      const fixedAttributes = setRequiredFields(object, attributes);

      return {
        attributes: {
          required: true,
          type: {
            type: 'hash',
            fields: fixedAttributes,
          },
        },
      };
    },
  },
} satisfies TQoreOptions;

const additionalOptions = {
  attributes: {
    type: 'hash',
    required: true,
  },
} satisfies TQoreOptions;

const createAttioObjectRecord = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: ATTIO_APP_NAME,
  action: 'create_object_record',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const token = context?.conn_opts?.token;
    const object = obj?.object;
    const attributes = obj?.attributes;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!object) missingValues.push('object');
    if (!attributes) missingValues.push('attributes');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await QorusRequest.post<{ data: any }>(
        {
          path: `/v2/objects/${object}/records`,
          data: {
            data: {
              values: attributes,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { url: ATTIO_APP_API_URL, endpointId: ATTIO_APP_NAME }
      );

      return formatAttioResponse(response?.data, 'objects', object!, token!);
    } catch (error) {
      throw new AttioError(`Failed to create object record: ${error}`);
    }
  },
});

export default createAttioObjectRecord;
