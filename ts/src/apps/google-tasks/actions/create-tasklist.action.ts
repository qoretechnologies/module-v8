import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';

const action = 'create_task_list';

const options = {
  title: { type: 'string', required: true },
} satisfies TQoreOptions;

const createTaskList = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['title'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    try {
      const response = await client.tasklists.insert({
        requestBody: {
          title,
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

export default createTaskList;
