import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';
import { getGoogleTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'update_task';

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
  parent: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleTaskAllowedValues,
  },
  previous: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleTaskAllowedValues,
  },
  title: {
    type: 'string',
    preselected: true,
    required: false,
  },
  notes: {
    type: 'string',
    preselected: true,
    required: false,
  },
  due: {
    type: 'date',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: [
      { value: 'needsAction', display_name: 'Incomplete' },
      { value: 'completed', display_name: 'Completed' },
    ],
  },
} satisfies TQoreOptions;

const updateTask = QoreAppCreator.createLocalizedAction<typeof options>({
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
    const { previous, parent, notes, due, title, status } = obj || {};

    try {
      const response = await client.tasks.update({
        tasklist: taskList,
        task,
        ...(previous && { previous }),
        requestBody: {
          id: task,
          ...(title && { title }),
          ...(due && { due }),
          ...(notes && { notes }),
          ...(parent && { parent }),
          ...(status && { status }),
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
      position: { type: 'string' },
      status: { type: 'string' },
      due: { type: 'string' },
      links: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              description: { type: 'string' },
              url: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
      },
      webViewLink: { type: 'string' },
    },
  },
});

export default updateTask;
