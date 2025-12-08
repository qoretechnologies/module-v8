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
import { getAttioWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-allowed-values';

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
  linked_object: {
    type: 'string',
    required: false,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectApiSlugAllowedValues,
  },
  linked_record_id: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getAttioObjectRecordIdAllowedValues,
    depends_on: ['linked_object'],
  },
  is_completed: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  sort: {
    type: 'string',
    required: false,
    default_value: 'oldest_first',
    allowed_values: [
      {
        value: 'oldest_first',
        display_name: 'Oldest First',
      },
      {
        value: 'newest_first',
        display_name: 'Newest First',
      },
    ],
  },
  assignee: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getAttioWorkspaceMemberIdAllowedValues,
  },
} satisfies TQoreOptions;

const getAttioTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'get_tasks',
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
    const linked_object = obj?.linked_object;
    const linked_record_id = obj?.linked_record_id;
    const is_completed = obj?.is_completed;
    const sort = obj?.sort;
    const assignee = obj?.assignee;

    try {
      const response = await QorusRequest.get<{ data: { data: any } }>(
        {
          path: `/v2/tasks`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            ...(limit && { limit }),
            ...(offset && { offset }),
            ...(linked_object && { linked_object }),
            ...(linked_record_id && { linked_record_id }),
            ...(is_completed && { is_completed }),
            ...(assignee && { assignee }),
            ...(sort && { sort: sort === 'oldest_first' ? 'created_at:asc' : 'created_at:desc' }),
          },
        },
        AttioEndpointData
      );

      return response?.data?.data;
    } catch (error) {
      throw new AttioError(`Failed to get tasks: ${error}`);
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
              task_id: { type: 'string' },
            },
          },
        },
        content_plaintext: { type: 'string' },
        is_completed: { type: 'bool' },
        deadline_at: { type: 'string' },
        linked_records: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                target_object_id: {
                  type: 'string',
                },
                target_record_id: {
                  type: 'string',
                },
              },
            },
          },
        },
        assignees: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                referenced_actor_type: {
                  type: 'string',
                },
                referenced_actor_id: {
                  type: 'string',
                },
              },
            },
          },
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
        created_at: { type: 'string' },
      },
    },
  },
});

export default getAttioTasks;
