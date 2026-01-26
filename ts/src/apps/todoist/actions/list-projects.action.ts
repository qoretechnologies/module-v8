import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';

const action = 'list_projects';

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

const listProjects = QoreAppCreator.createLocalizedAction<typeof options>({
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
        path: `projects`,
        method: 'GET',
        params: {
          ...(cursor && { cursor }),
          limit,
        },
        token,
      });

      return {
        projects: response.results,
        next_page_token: response.next_cursor || null,
      };
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      projects: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              can_assign_tasks: { type: 'bool' },
              child_order: { type: 'integer' },
              color: { type: 'string' },
              creator_uid: { type: 'string' },
              created_at: { type: 'string' },
              is_archived: { type: 'bool' },
              is_deleted: { type: 'bool' },
              is_favorite: { type: 'bool' },
              is_frozen: { type: 'bool' },
              name: { type: 'string' },
              updated_at: { type: 'string' },
              view_style: { type: 'string' },
              default_order: { type: 'integer' },
              description: { type: 'string' },
              public_key: { type: 'string' },
              access: {
                type: {
                  type: 'hash',
                  fields: {
                    visibility: { type: 'string' },
                    configuration: { type: 'hash' },
                  },
                },
              },
              role: { type: 'string' },
              parent_id: { type: 'string' },
              inbox_project: { type: 'bool' },
              is_collapsed: { type: 'bool' },
              is_shared: { type: 'bool' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listProjects;
