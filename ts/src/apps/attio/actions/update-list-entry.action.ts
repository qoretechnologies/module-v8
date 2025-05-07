import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioListApiSlugAllowedValues } from '../helpers/get-list-allowed-values';
import { getAttioListEntryIdAllowedValues } from '../helpers/get-list-entry-id-allowed-values';
import { getAttioAttributesAsQoreOptions } from '../helpers/get-object-properties';
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
  entry_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getAttioListEntryIdAllowedValues,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  attributes: {
    type: 'hash',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const updateAttioListEntry = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  app: ATTIO_APP_NAME,
  action: 'update_list_entry',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const token = context?.conn_opts?.token;
    const list = obj?.list;
    const attributes = obj?.attributes || {};
    const entry_id = obj?.entry_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!list) missingValues.push('list');
    if (!attributes) missingValues.push('attributes');
    if (!entry_id) missingValues.push('entry_id');

    if (missingValues.length > 0) {
      throw new AttioError(`Missing required values: ${missingValues.join(', ')}`);
    }

    try {
      const response = await axios.patch(
        `${ATTIO_APP_API_URL}/v2/lists/${list}/entries/${entry_id}`,
        {
          data: {
            entry_values: attributes,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return formatAttioResponse(response?.data, 'lists', list!, token!);
    } catch (error) {
      throw new AttioError(`Failed to update list entry: ${error}`);
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

export default updateAttioListEntry;
