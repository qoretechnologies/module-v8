import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'get_project';

const options = {
  project_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTodoistProjectAllowedValues,
  },
} satisfies TQoreOptions;

const getProject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['project_id'],
      ErrorClass: TodoistError,
    });

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `projects/${project_id}`,
        method: 'GET',
        token,
      });

      return response;
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
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
});

export default getProject;
