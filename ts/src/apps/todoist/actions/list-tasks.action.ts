import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getTodoistSectionAllowedValues } from '../helpers/get-section-allowed-values';
import { getTodoistLabelAllowedValues } from '../helpers/get-label-allowed-values';
import { getTodoistTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'list_tasks';

const options = {
  cursor: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
  },
  ids: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    required: false,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getTodoistTaskAllowedValues,
  },
  project_id: {
    type: 'string',
    required: false,
    get_allowed_values: getTodoistProjectAllowedValues,
  },
  section_id: {
    type: 'string',
    required: false,
    get_allowed_values: getTodoistSectionAllowedValues,
  },
  label: {
    type: 'string',
    required: false,
    get_allowed_values: getTodoistLabelAllowedValues,
  },
} satisfies TQoreOptions;

const listTasks = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { cursor, limit = 50, section_id, project_id, label } = obj || {};

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `tasks`,
        method: 'GET',
        params: {
          limit,
          ...(label && { label }),
          ...(cursor && { cursor }),
          ...(section_id && { section_id }),
          ...(project_id && { project_id }),
        },
        token,
      });

      return {
        tasks: response.results,
        next_page_token: response.next_cursor || null,
      };
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      tasks: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              user_id: { type: 'string' },
              id: { type: 'string' },
              project_id: { type: 'string' },
              section_id: { type: 'string' },
              parent_id: { type: 'string' },
              added_by_uid: { type: 'string' },
              assigned_by_uid: { type: 'string' },
              responsible_uid: { type: 'string' },
              labels: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              deadline: {
                type: {
                  type: 'hash',
                  fields: {
                    date: { type: 'string' },
                    lang: { type: 'string' },
                  },
                },
              },
              duration: {
                type: {
                  type: 'hash',
                  fields: {
                    amount: { type: 'integer' },
                    unit: { type: 'string' },
                  },
                },
              },
              checked: { type: 'bool' },
              is_deleted: { type: 'bool' },
              added_at: { type: 'string' },
              completed_at: { type: 'string' },
              updated_at: { type: 'string' },
              due: {
                type: {
                  type: 'hash',
                  fields: {
                    date: { type: 'string' },
                    datetime: { type: 'string' },
                    is_recurring: { type: 'bool' },
                    lang: { type: 'string' },
                    string: { type: 'string' },
                    timezone: { type: 'string' },
                  },
                },
              },
              priority: { type: 'integer' },
              child_order: { type: 'integer' },
              content: { type: 'string' },
              description: { type: 'string' },
              note_count: { type: 'integer' },
              day_order: { type: 'integer' },
              is_collapsed: { type: 'bool' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listTasks;
