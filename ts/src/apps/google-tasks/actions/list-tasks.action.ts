import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'list_tasks';

const options = {
  taskList: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
  completedMax: {
    type: 'date',
    required: false,
  },
  completedMin: {
    type: 'date',
    required: false,
  },
  dueMax: {
    type: 'date',
    required: false,
  },
  dueMin: {
    type: 'date',
    required: false,
  },
  maxResults: {
    type: 'number',
    required: false,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
  showCompleted: {
    type: 'bool',
    required: false,
  },
  showDeleted: {
    type: 'bool',
    required: false,
  },
  showHidden: {
    type: 'bool',
    required: false,
  },
  updateMin: {
    type: 'date',
    required: false,
  },
  showAssigned: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const listTasks = QoreAppCreator.createLocalizedAction<typeof options>({
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
    const {
      completedMax,
      completedMin,
      dueMax,
      dueMin,
      maxResults = 10,
      pageToken,
      showCompleted,
      showDeleted,
      showHidden,
      updateMin,
      showAssigned,
    } = obj || {};

    try {
      const response = await client.tasks.list({
        tasklist: taskList,
        maxResults,
        ...(pageToken && { pageToken }),
        ...(completedMax && { completedMax }),
        ...(completedMin && { completedMin }),
        ...(updateMin && { updateMin }),
        ...(dueMax && { dueMax }),
        ...(dueMin && { dueMin }),
        ...(showCompleted !== undefined && { showCompleted }),
        ...(showDeleted !== undefined && { showDeleted }),
        ...(showHidden !== undefined && { showHidden }),
        ...(showAssigned !== undefined && { showAssigned }),
      });

      return omit(response.data, ['kind', 'etag']);
    } catch (error) {
      throw new GoogleTasksError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      nextPageToken: { type: 'string' },
      items: {
        type: {
          type: 'list',
          element_type: {
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
        },
      },
    },
  },
});

export default listTasks;
