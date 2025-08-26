import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';
import { getGoogleTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'delete_task';

const options = {
  taskList: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
  task: {
    type: 'string',
    required: true,
    depends_on: ['taskList'],
    get_allowed_values: getGoogleTaskAllowedValues,
  },
} satisfies TQoreOptions;

const deleteTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, taskList, task } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['taskList', 'task'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    try {
      await client.tasks.delete({
        tasklist: taskList,
        task,
      });

      return { id: task };
    } catch (error) {
      throw new GoogleTasksError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
    },
  },
});

export default deleteTask;
