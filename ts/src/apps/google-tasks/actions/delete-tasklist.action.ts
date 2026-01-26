import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'delete_task_list';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
} satisfies TQoreOptions;

const deleteTaskList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['id'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    try {
      await client.tasklists.delete({
        tasklist: id,
      });

      return { id };
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

export default deleteTaskList;
