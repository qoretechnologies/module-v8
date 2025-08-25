import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';
import { getGoogleTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'create_task';

const options = {
  taskList: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleTasksListAllowedValues,
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
    required: true,
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
} satisfies TQoreOptions;

const createTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, taskList, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['taskList', 'title'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);
    const { previous, parent, notes, due } = obj || {};

    try {
      const response = await client.tasks.insert({
        tasklist: taskList,
        ...(previous && { previous }),
        requestBody: {
          title,
          ...(due && { due }),
          ...(notes && { notes }),
          ...(parent && { parent }),
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

export default createTask;
