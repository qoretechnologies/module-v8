import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'update_task_list';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
  title: { type: 'string', required: true },
} satisfies TQoreOptions;

const updateTaskList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title', 'id'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    try {
      const response = await client.tasklists.update({
        tasklist: id,
        requestBody: {
          title,
          id,
        },
      });

      return omit(response.data, ['kind', 'etag']);
    } catch (error) {
      throw new GoogleTasksError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
      updated: { type: 'string' },
      selfLink: { type: 'string' },
    },
  },
});

export default updateTaskList;
