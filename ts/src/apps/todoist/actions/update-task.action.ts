import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getTodoistSectionAllowedValues } from '../helpers/get-section-allowed-values';
import { getTodoistLabelAllowedValues } from '../helpers/get-label-allowed-values';
import { getTodoistTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'update_task';

const options = {
  task_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTodoistTaskAllowedValues,
  },
  content: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
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
  order: {
    type: 'integer',
    required: false,
  },
  labels: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getTodoistLabelAllowedValues,
    element_allowed_values_creatable: true,
  },
  priority: {
    type: 'integer',
    required: false,
  },
  due_datetime: {
    type: 'date',
    required: false,
  },
  duration: {
    type: {
      type: 'hash',
      fields: {
        amount: { type: 'integer', required: true },
        unit: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'minute', display_name: 'Minute' },
            { value: 'day', display_name: 'Day' },
          ],
        },
      },
    },
    required: false,
  },
} satisfies TQoreOptions;

const updateTask = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const {
      description,
      due_datetime,
      content,
      duration,
      labels,
      order,
      priority,
      project_id,
      section_id,
    } = obj || {};

    let duration_unit: string | undefined;
    let duration_amount: number | undefined;

    if (duration) {
      duration_unit = duration.unit;
      duration_amount = duration.amount;
    }

    try {
      const response = await todoistApiClient({
        path: `tasks/${task_id}`,
        method: 'POST',
        body: {
          ...(content && { content }),
          ...(description && { description }),
          ...(due_datetime && { due_datetime }),
          ...(duration_unit && { duration_unit }),
          ...(duration_amount && { duration }),
          ...(labels && { labels }),
          ...(order !== undefined && { order }),
          ...(priority !== undefined && { priority }),
          ...(project_id && { project_id }),
          ...(section_id && { section_id }),
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

export default updateTask;
