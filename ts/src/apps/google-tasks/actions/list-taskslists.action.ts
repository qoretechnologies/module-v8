import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GOOGLE_TASKS_APP_NAME, GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';

const action = 'list_tasks_lists';

const options = {
  maxResults: {
    type: 'number',
    default_value: 10,
    required: false,
  },
  nextPageToken: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listTaskLists = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleTasksError,
    });

    const client = createGoogleTasksClient(token);

    const { maxResults = 10, nextPageToken } = obj || {};

    try {
      const response = await client.tasklists.list({
        maxResults,
        ...(nextPageToken && { pageToken: nextPageToken }),
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
              kind: { type: 'string' },
              id: { type: 'string' },
              etag: { type: 'string' },
              title: { type: 'string' },
              updated: { type: 'string' },
              selfLink: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default listTaskLists;
