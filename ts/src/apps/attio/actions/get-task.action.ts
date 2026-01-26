import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ATTIO_APP_NAME, AttioEndpointData, AttioError } from '../constants';
import { getAttioTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';

const options = {
  task_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAttioTaskIdAllowedValues,
  },
} satisfies TQoreOptions;

const getAttioTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ATTIO_APP_NAME,
  action: 'get_task',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['task_id'],
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const response = await QorusRequest.get<{ data: { data: any } }>(
        {
          path: `/v2/tasks/${task_id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        AttioEndpointData
      );

      return response?.data?.data;
    } catch (error) {
      throw new AttioError(`Failed to get task: ${error}`);
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
});

export default getAttioTask;
