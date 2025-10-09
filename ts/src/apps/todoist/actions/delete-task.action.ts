import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'delete_task';

const options = {
  task_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTodoistTaskAllowedValues,
  },
} satisfies TQoreOptions;

const deleteTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task_id'],
      ErrorClass: TodoistError,
    });

    try {
      await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `tasks/${task_id}`,
        method: 'DELETE',
        token,
      });
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteTask;
