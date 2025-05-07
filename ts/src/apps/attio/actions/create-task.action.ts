import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-allowed-values';

const options = {
  content: {
    required: true,
    type: 'string',
  },
  deadline_at: {
    required: true,
    type: 'date',
  },
  is_completed: {
    required: true,
    type: 'boolean',
    default_value: false,
  },
  assignees: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAttioWorkspaceMemberIdAllowedValues,
  },
} satisfies TQoreOptions;

const createAttioTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'create_task',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, content, deadline_at, is_completed } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['content', 'deadline_at', 'is_completed'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    const assignees = (obj?.assignees || []) as string[];

    try {
      const response = await QorusRequest.post<{ data: { data: any } }>(
        {
          path: `/v2/tasks`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            data: {
              content,
              deadline_at,
              is_completed,
              format: 'plaintext',
              linked_records: [],
              assignees: assignees.map((assignee) => ({
                referenced_actor_type: 'workspace-member',
                referenced_actor_id: assignee,
              })),
            },
          },
        },
        AttioEndpointData
      );

      return response?.data?.data;
    } catch (error) {
      throw new AttioError(`Failed to create a task: ${error}`);
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
            task_id: { type: 'string' },
          },
        },
      },
      content_plaintext: { type: 'string' },
      is_completed: { type: 'boolean' },
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
        example_value: [
          {
            referenced_actor_type: 'workspace-member',
            referenced_actor_id: 'attio_workspace_member_id',
          },
        ],
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
});

export default createAttioTask;
