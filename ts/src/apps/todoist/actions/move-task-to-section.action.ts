import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistTaskAllowedValues } from '../helpers/get-task-allowed-values';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getTodoistSectionAllowedValues } from '../helpers/get-section-allowed-values';

const action = 'move_task_to_section';

const options = {
  task_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTodoistTaskAllowedValues,
  },
  section_id: {
    type: 'string',
    get_allowed_values: getTodoistSectionAllowedValues,
    required_groups: ['task_destination'],
  },
  project_id: {
    type: 'string',
    get_allowed_values: getTodoistProjectAllowedValues,
    required_groups: ['task_destination'],
  },
} satisfies TQoreOptions;

const moveTaskToSection = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task_id'],
      ErrorClass: TodoistError,
    });

    const { section_id, project_id } = obj || {};
    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `tasks/${task_id}/move`,
        method: 'POST',
        token,
        body: {
          ...(section_id && { section_id }),
          ...(project_id && { project_id }),
        },
      });

      return response;
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
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
});

export default moveTaskToSection;
