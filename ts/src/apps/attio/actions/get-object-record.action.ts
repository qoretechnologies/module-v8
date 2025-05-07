import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { formatAttioResponse } from '../helpers/format-response';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { getAttioObjectRecordIdAllowedValues } from '../helpers/get-object-record-id-allowed-values';
import { getAttioResponseType } from '../helpers/get-response-type';

const options = {
  object: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
    on_change: ['refetch'],
  },
  record_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectRecordIdAllowedValues,
    depends_on: ['object'],
  },
} satisfies TQoreOptions;

const getAttioObjectRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'get_object_record',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { record_id, object, token } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['object', 'record_id'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await QorusRequest.get<{ data: any }>(
        {
          path: `/v2/objects/${object}/records/${record_id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        AttioEndpointData
      );

      return formatAttioResponse(response?.data, 'objects', object!, token!);
    } catch (error) {
      throw new AttioError(`Failed to get object record: ${error}`);
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

export default getAttioObjectRecord;
