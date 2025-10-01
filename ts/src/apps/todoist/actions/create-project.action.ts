import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';

const action = 'create_project';

const options = {
  name: {
    required: true,
    type: 'string',
  },
  description: {
    required: false,
    type: 'string',
  },
  color: {
    required: false,
    type: 'string',
  },
  view_style: {
    required: false,
    type: 'string',
    allowed_values: [
      { value: 'list', display_name: 'List' },
      { value: 'board', display_name: 'Board' },
      { value: 'calendar', display_name: 'Calendar' },
    ],
  },
  is_favorite: {
    required: false,
    type: 'boolean',
  },
} satisfies TQoreOptions;

const createProject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['name'],
      ErrorClass: TodoistError,
    });

    const { description, color, view_style, is_favorite = false } = obj || {};

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `projects`,
        method: 'POST',
        body: {
          name,
          is_favorite,
          ...(description && { description }),
          ...(color && { color }),
          ...(view_style && { view_style }),
        },
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
      can_assign_tasks: { type: 'boolean' },
      child_order: { type: 'integer' },
      color: { type: 'string' },
      creator_uid: { type: 'string' },
      created_at: { type: 'string' },
      is_archived: { type: 'boolean' },
      is_deleted: { type: 'boolean' },
      is_favorite: { type: 'boolean' },
      is_frozen: { type: 'boolean' },
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
      inbox_project: { type: 'boolean' },
      is_collapsed: { type: 'boolean' },
      is_shared: { type: 'boolean' },
    },
  },
});

export default createProject;
