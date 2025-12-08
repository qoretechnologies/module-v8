import { tasks_v1 } from '@googleapis/tasks';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_TASKS_APP_NAME } from '../constants';
import { GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from '../helpers/constants';
import { getGoogleTasksListAllowedValues } from '../helpers/get-list-allowed-values';

const action = 'new_completed_task';

const options = {
  taskList: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_allowed_values: getGoogleTasksListAllowedValues,
  },
  includeAssigned: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const NewCompletedTask = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_TASKS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, taskList } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['taskList'],
      ErrorClass: GoogleTasksError,
    });

    const includeAssigned = context?.opts?.includeAssigned || false;

    const getItems = () => {
      return fetchLatestTasks({
        token,
        taskList,
        includeAssigned,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `google_tasks_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, taskList } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['taskList'],
      ErrorClass: GoogleTasksError,
    });

    const includeAssigned = context?.opts?.includeAssigned || false;

    const tasks = await fetchLatestTasks({
      token,
      taskList,
      includeAssigned,
    });

    return tasks?.length ? tasks[0] : null;
  },
  event_info: {
    desc: 'Google Tasks New Completed Task Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        title: { type: 'string' },
        updated: { type: 'string' },
        selfLink: { type: 'string' },
        position: { type: 'string' },
        status: { type: 'string' },
        due: { type: 'string' },
        links: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                description: { type: 'string' },
                url: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
        },
        webViewLink: { type: 'string' },
      },
    },
  },
});

const fetchLatestTasks = async (options: {
  token: string;
  taskList: string;
  includeAssigned: boolean;
}): Promise<tasks_v1.Schema$Task[]> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, taskList, includeAssigned } = options;

  const COMPLETED_TASKS_LOOKBACK_HOURS = 24;
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  const completedMin = new Date(
    new Date().getTime() - COMPLETED_TASKS_LOOKBACK_HOURS * MILLISECONDS_PER_HOUR
  ).toISOString();

  try {
    const client = createGoogleTasksClient(token);

    const tasksResponse = await client.tasks.list({
      tasklist: taskList,
      maxResults,
      showCompleted: true,
      showHidden: true,
      completedMin,
      showAssigned: includeAssigned,
    });

    return tasksResponse.data.items || [];
  } catch (error) {
    throw new GoogleTasksError(`Failed to fetch latest tasks: ${error.message || error}`);
  }
};

export default NewCompletedTask;
