import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { attioApiClient } from '../../helpers/client';

export type TAttioTask = {
  id: {
    workspace_id: string;
    task_id: string;
  };
  created_by_actor: {
    type: string;
    id: string;
  };
};

export const AttioTaskCreatedEventInfo = {
  desc: `Triggered when a new task is created in Attio.`,
  type: {
    type: 'hash',
    fields: {
      event_type: { type: 'string' },
      id: {
        type: {
          type: 'hash',
          fields: {
            workspace_id: { type: 'string' },
            task_id: { type: 'string' },
          },
        },
      },
      actor: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;

export const getAttioTaskCreatedEventDataExample: (
  context: TQoreAppActionFunctionContext<TCustomConnOptions, TQoreOptions>
) => Promise<Record<string, any>> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  try {
    const tasks = await attioApiClient<TAttioTask[]>({
      path: `tasks`,
      method: 'GET',
      object: 'data',
      token,
      params: {
        limit: '1',
      },
    });

    const task = tasks[0];

    if (!task) {
      throw new Error('No tasks found');
    }

    return {
      event_type: `task.created`,
      id: {
        workspace_id: task.id.workspace_id,
        task_id: task.id.task_id,
      },
      actor: {
        type: task.created_by_actor.type,
        id: task.created_by_actor.id,
      },
    };
  } catch (error) {
    throw new AttioError(`Failed to get example event data ${error}`);
  }
};
