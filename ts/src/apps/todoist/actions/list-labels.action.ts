import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';

const action = 'list_labels';

const options = {
  cursor: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const listLabels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TodoistError,
    });

    const { cursor, limit = 50 } = obj || {};

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `labels`,
        method: 'GET',
        params: {
          ...(cursor && { cursor }),
          limit,
        },
        token,
      });

      return {
        labels: response.results,
        next_page_token: response.next_cursor || null,
      };
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      labels: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              order: { type: 'integer' },
              color: { type: 'string' },
              is_favorite: { type: 'boolean' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listLabels;
