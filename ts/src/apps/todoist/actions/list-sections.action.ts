import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'list_sections';

const options = {
  project_id: {
    type: 'string',
    required: false,
    get_allowed_values: getTodoistProjectAllowedValues,
  },
  cursor: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const listSections = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { cursor, limit = 50, project_id } = obj || {};

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `sections`,
        method: 'GET',
        params: {
          ...(cursor && { cursor }),
          ...(project_id && { project_id }),
          limit,
        },
        token,
      });

      return {
        sections: response.results,
        next_page_token: response.next_cursor || null,
      };
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      sections: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              user_id: { type: 'string' },
              project_id: { type: 'string' },
              added_at: { type: 'string' },
              updated_at: { type: 'string' },
              archived_at: { type: 'string' },
              name: { type: 'string' },
              section_order: { type: 'integer' },
              is_archived: { type: 'boolean' },
              is_deleted: { type: 'boolean' },
              is_collapsed: { type: 'boolean' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listSections;
