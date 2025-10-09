import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getTodoistSectionAllowedValues } from '../helpers/get-section-allowed-values';

const action = 'new_completed_task';

const options = {
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
  query: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    desc: 'The filter query to use, see [documentation](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH) for more details',
    allowed_values: [
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

const NewCompletedTask = QoreAppCreator.createLocalizedTrigger({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: TodoistError,
    });

    const { project_id, section_id, query } = context.opts || {};

    let lastPollTime = new Date().toISOString();

    const updateLastPollTime = () => {
      lastPollTime = new Date().toISOString();
    };

    const getItems = () => {
      return fetchLatestTasks({
        token,
        since: lastPollTime,
        ...(project_id && { project_id }),
        ...(section_id && { section_id }),
        ...(query && { query }),
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `todoist_${action}`,
      uniqueField: 'id',
      updateLastPollTime,
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: TodoistError,
    });

    const since = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
    const until = new Date().toISOString();

    const { project_id, section_id, query } = context.opts || {};

    const tasks = await fetchLatestTasks({
      token,
      since,
      until,
      ...(project_id && { project_id }),
      ...(section_id && { section_id }),
      ...(query && { query }),
    });

    return tasks?.length ? tasks[0] : null;
  },
  event_info: {
    desc: 'Todoist New Task Trigger Event Info',
    type: {
      type: 'hash',
    },
  },
});

const fetchLatestTasks = async (options: {
  token: string;
  since: string;
  until?: string;
  project_id?: string;
  section_id?: string;
  query?: string;
}): Promise<Record<string, any>[]> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  const { token, project_id, since, until = new Date().toISOString(), section_id, query } = options;

  try {
    const tasksResponse = await todoistApiClient<{
      results: Record<string, any>[];
    }>({
      token,
      path: 'tasks/completed/by_completion_date',
      params: {
        ...(project_id && { project_id }),
        ...(section_id && { section_id }),
        ...(query && { filter_query: query }),
        limit: maxResults.toString(),
        since,
        until,
      },
    });

    return tasksResponse.results || [];
  } catch (error) {
    throw new TodoistError(`Failed to fetch latest tasks: ${error.message || error}`);
  }
};

export default NewCompletedTask;
