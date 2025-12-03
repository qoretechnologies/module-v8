import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { CraftTaskResponseType } from '../response-types/task';

const action = 'create_task';

const options = {
  markdown: {
    type: 'string',
    required: true,
  },
  taskInfo: {
    type: {
      type: 'hash',
      required: false,
      fields: {
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
      },
    },
  },
  location: {
    required: true,
    type: {
      type: 'hash',
      fields: {
        type: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'inbox', display_name: 'Inbox' },
            { value: 'dailyNote', display_name: 'Daily Note' },
          ],
        },
        date: {
          type: 'string',
          required: false,
        },
      },
    },
  },
} satisfies TQoreOptions;

type TCreateTasksRequest = {
  tasks: Array<{
    markdown: string;
    taskInfo?: {
      state?: 'todo' | 'done' | 'canceled';
      scheduleDate?: string;
      deadlineDate?: string;
    };
    location: { type: 'inbox' } | { type: 'dailyNote'; date?: string };
  }>;
};

type TCreateTasksResponse = {
  items: Array<{
    id: string;
    markdown: string;
    taskInfo: {
      state: 'todo' | 'done' | 'canceled';
      scheduleDate?: string;
      deadlineDate?: string;
    };
    location:
      | { type: 'inbox' }
      | { type: 'document'; title: string }
      | { type: 'dailyNote'; date: string };
  }>;
};

const CreateTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, markdown, location } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['markdown', 'location'],
      ErrorClass: CraftError,
    });

    const { taskInfo = {} } = obj || {};
    const token = context?.conn_opts?.token;

    const requestBody: TCreateTasksRequest = { tasks: [{ markdown, taskInfo, location }] };

    try {
      const response = await craftApiClient<TCreateTasksResponse>({
        path: 'tasks',
        method: 'POST',
        body: requestBody,
        url,
        token,
      });

      const task = response.items?.[0];

      return task;
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: CraftTaskResponseType,
});

export default CreateTask;
