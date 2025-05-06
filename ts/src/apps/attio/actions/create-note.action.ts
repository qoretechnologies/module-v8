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
  parent_object: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
    on_change: ['refetch'],
  },
  parent_record_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectRecordIdAllowedValues,
    depends_on: ['parent_object'],
  },
  title: {
    required: true,
    type: 'string',
  },
  format: {
    required: true,
    type: 'string',
    default_value: 'plaintext',
    allowed_values: [
      {
        value: 'plaintext',
        display_name: 'Plain Text',
      },
      {
        value: 'markdown',
        display_name: 'Markdown',
      },
    ],
  },
  content: {
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const createAttioNote = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'create_note',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, ...otherOptions } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['content', 'parent_object', 'parent_record_id', 'title', 'format'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await QorusRequest.post<{ data: { data: any } }>(
        {
          path: `/v2/notes`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            data: otherOptions,
          },
        },
        AttioEndpointData
      );

      return response?.data?.data;
    } catch (error) {
      throw new AttioError(`Failed to create a note: ${error}`);
    }
  },
  response_type: {
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
});

export default createAttioNote;
