import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';

const action = 'get_tasks_by_filter';

const options = {
  cursor: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
  },
  query: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    desc: 'The filter query to use, see [documentation](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH) for more details',
    allowed_values: [
      {
        value: 'today | overdue',
        display_name: 'Today or Overdue',
        short_desc: 'See all tasks that are overdue or due today',
      },
      {
        value: 'no date & no deadline',
        display_name: 'No Date & No Deadline',
        short_desc: 'See all tasks that do not have a date or deadline',
      },
      {
        value: 'assigned to: me',
        display_name: 'Assigned to Me',
        short_desc: 'See all tasks assigned to you',
      },
    ],
  },
} satisfies TQoreOptions;

const getTasksByFilter = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, query } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['query'],
      ErrorClass: TodoistError,
    });

    const { cursor, limit = 50 } = obj || {};

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `tasks/filter`,
        method: 'GET',
        params: {
          limit,
          query,
          ...(cursor && { cursor }),
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

export default getTasksByFilter;
