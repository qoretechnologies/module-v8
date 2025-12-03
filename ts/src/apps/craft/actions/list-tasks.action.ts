import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { CraftTaskResponseType } from '../response-types/task';

const action = 'list_tasks';

const options = {
  scope: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'active', display_name: 'Active' },
      { value: 'upcoming', display_name: 'Upcoming' },
      { value: 'inbox', display_name: 'Inbox' },
      { value: 'logbook', display_name: 'Logbook' },
    ],
  },
} satisfies TQoreOptions;

type TListTasksResponse = {
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

const ListTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      ErrorClass: CraftError,
    });

    const { scope } = obj || {};
    const token = context?.conn_opts?.token;

    try {
      const response = await craftApiClient<TListTasksResponse>({
        path: 'tasks',
        method: 'GET',
        ...(scope && {
          params: { scope },
        }),
        url,
        token,
      });

      return response.items;
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CraftTaskResponseType,
  },
});

export default ListTasks;
