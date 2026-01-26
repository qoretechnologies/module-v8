import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftActiveTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'update_task';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftActiveTaskAllowedValues,
  },
  markdown: {
    type: 'string',
    required: false,
  },
  state: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'todo', display_name: 'To Do' },
      { value: 'done', display_name: 'Done' },
      { value: 'canceled', display_name: 'Canceled' },
    ],
  },
  scheduleDate: {
    type: 'string',
    required: false,
  },
  deadlineDate: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

type TUpdateTasksRequest = {
  tasksToUpdate: Array<{
    id: string;
    markdown?: string;
    taskInfo?: {
      state?: 'todo' | 'done' | 'canceled';
      scheduleDate?: string;
      deadlineDate?: string;
    };
  }>;
};

type TTaskInfoUpdate = {
  state?: 'todo' | 'done' | 'canceled';
  scheduleDate?: string;
  deadlineDate?: string;
};

type TUpdateTasksResponse = {
  items: Array<{
    id: string;
    markdown?: string;
    taskInfo?: TTaskInfoUpdate;
  }>;
};

const UpdateTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['id'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { markdown, id, ...taskInfo } = obj || {};

    const requestBody: TUpdateTasksRequest = {
      tasksToUpdate: [
        {
          id: id!,
          ...(markdown !== undefined ? { markdown } : {}),
          ...(Object.keys(taskInfo).length > 0 && { taskInfo: taskInfo as TTaskInfoUpdate }),
        },
      ],
    };

    try {
      const response = await craftApiClient<TUpdateTasksResponse>({
        path: 'tasks',
        method: 'PUT',
        body: requestBody,
        url,
        token,
      });

      const taskUpdate = response.items[0];

      return taskUpdate;
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      markdown: { type: 'string' },
      taskInfo: {
        type: {
          type: 'hash',
          fields: {
            state: { type: 'string' },
            scheduleDate: { type: 'string' },
            deadlineDate: { type: 'string' },
          },
        },
      },
    },
  },
});

export default UpdateTask;
