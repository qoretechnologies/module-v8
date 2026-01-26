import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioListApiSlugAllowedValues } from '../helpers/get-list-allowed-values';
import { getAttioAttributesAsQoreOptions } from '../helpers/get-object-properties';
import { getAttioListParentRecordIdAllowedValues } from '../helpers/get-list-parent-record-id-allowed-values';
import { getListParentObjectDefaultValue } from '../helpers/get-list-parent-object-default-value';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  list: {
    required: true,
    type: 'string',
    get_allowed_values: getAttioListApiSlugAllowedValues,
    on_change: ['refetch'],
    get_dependent_options: async (context) => {
      const list = context?.opts?.list;
      const token = context?.conn_opts?.token;

      if (!list)
        return {
          attributes: {
            required: true,
            type: 'hash',
          },
        };

      const attributes = await getAttioAttributesAsQoreOptions('lists', list, token!);

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
  parent_record_id: {
    type: 'string',
    required: true,
    get_allowed_values: getAttioListParentRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  attributes: {
    type: 'hash',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const createAttioListEntry = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: ATTIO_APP_NAME,
  action: 'create_list_entry',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const token = context?.conn_opts?.token;
    const list = obj?.list;
    const attributes = obj?.attributes || {};
    const parent_record_id = obj?.parent_record_id;
    const parent_object = await getListParentObjectDefaultValue({ ...context, opts: obj });

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!list) missingValues.push('list');
    if (!attributes) missingValues.push('attributes');
    if (!parent_record_id) missingValues.push('parent_record_id');
    if (!parent_object) missingValues.push('parent_object');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await QorusRequest.post<{ data: any }>(
        {
          path: `/v2/lists/${list}/entries`,
          data: {
            data: {
              parent_record_id,
              parent_object,
              entry_values: attributes,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { url: ATTIO_APP_API_URL, endpointId: ATTIO_APP_NAME }
      );

      return formatAttioResponse(response?.data, 'lists', list!, token!);
    } catch (error) {
      throw new AttioError(`Failed to create list entry: ${error}`);
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

    return await getAttioResponseType({
      list,
      token,
    });
  },
});

export default createAttioListEntry;
