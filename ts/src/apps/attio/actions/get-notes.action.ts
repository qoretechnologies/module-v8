import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioObjectApiSlugAllowedValues } from '../helpers/get-object-allowed-values';
import { getAttioObjectRecordIdAllowedValues } from '../helpers/get-object-record-id-allowed-values';

const options = {
  limit: {
    type: 'integer',
    required: false,
    default_value: 10,
  },
  offset: {
    type: 'integer',
    required: false,
    default_value: 0,
  },
  parent_object: {
    type: 'string',
    required: false,
    on_change: ['refetch'],
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
  },
  parent_record_id: {
    type: 'string',
    required: false,
    get_allowed_values: getAttioObjectRecordIdAllowedValues,
    depends_on: ['parent_object'],
  },
} satisfies TQoreOptions;

const getAttioNotes = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'get_notes',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    const limit = obj?.limit;
    const offset = obj?.offset;
    const parent_object = obj?.parent_object;
    const parent_record_id = obj?.parent_record_id;

    try {
      const response = await QorusRequest.get<{ data: { data: any } }>(
        {
          path: `/v2/notes`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...(limit && { limit }),
            ...(offset && { offset }),
            ...(parent_object && { parent_object }),
            ...(parent_record_id && { parent_record_id }),
          },
        },
        AttioEndpointData
      );

      return response?.data?.data;
    } catch (error) {
      throw new AttioError(`Failed to get notes: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: {
          type: {
            type: 'hash',
            fields: {
              workspace_id: { type: 'string' },
              note_id: { type: 'string' },
            },
          },
        },
        parent_object: {
          type: 'string',
        },
        parent_record_id: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        content_plaintext: {
          type: 'string',
        },
        content_markdown: {
          type: 'string',
        },
        created_by_actor: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        created_at: {
          type: 'string',
        },
      },
    },
  },
});

export default getAttioNotes;
