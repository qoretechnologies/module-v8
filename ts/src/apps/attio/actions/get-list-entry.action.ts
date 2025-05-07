import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_API_URL, ATTIO_APP_NAME, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioListApiSlugAllowedValues } from '../helpers/get-list-allowed-values';
import { getAttioListEntryIdAllowedValues } from '../helpers/get-list-entry-id-allowed-values';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  list: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioListApiSlugAllowedValues,
    on_change: ['refetch'],
  },
  entry_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioListEntryIdAllowedValues,
    depends_on: ['list'],
  },
} satisfies TQoreOptions;

const getAttioListEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'get_list_entry',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { entry_id, list, token } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['list', 'entry_id'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await QorusRequest.get<{ data: any }>(
        {
          path: `/v2/lists/${list}/entries/${entry_id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { url: ATTIO_APP_API_URL, endpointId: ATTIO_APP_NAME }
      );

      return formatAttioResponse(response?.data, 'lists', list!, token!);
    } catch (error) {
      throw new AttioError(`Failed to get list entry: ${error}`);
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

export default getAttioListEntry;
