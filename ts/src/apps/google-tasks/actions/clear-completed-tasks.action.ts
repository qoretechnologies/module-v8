import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'clear_completed_tasks';

const options = {
  taskList: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
} satisfies TQoreOptions;

const clearCompletedTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, taskList } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['taskList'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    try {
      await client.tasks.clear({
        tasklist: taskList,
      });

      return {
        id: taskList,
      };
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

export default clearCompletedTasks;
