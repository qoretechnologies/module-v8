import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CraftError } from '../constants';
import { fetchCraftAllowedValues } from './constants';

type CraftTask = {
  id: string;
  markdown: string;
  taskInfo: {
    state: 'todo' | 'done' | 'canceled';
    scheduleDate?: string;
    deadlineDate?: string;
  };
  location:
    | { type: 'inbox' }
    | { type: 'document'; title: string }
    | { type: 'dailyNote'; date: string };
};

const mapTaskToAllowedValue = (task: CraftTask): IQoreAllowedValue<string> => {
  const locationDesc =
    task.location.type === 'inbox'
      ? 'Inbox'
      : task.location.type === 'document'
        ? `Document: ${task.location.title}`
        : `Daily Note: ${task.location.date}`;

  const stateDesc =
    task.taskInfo.state === 'todo' ? '⚪' : task.taskInfo.state === 'done' ? '✅' : '❌';

  const scheduleInfo = task.taskInfo.scheduleDate
    ? ` | Scheduled: ${task.taskInfo.scheduleDate}`
    : '';
  const deadlineInfo = task.taskInfo.deadlineDate
    ? ` | Deadline: ${task.taskInfo.deadlineDate}`
    : '';

  return {
    value: task.id,
    display_name: `${stateDesc} ${task.markdown.substring(0, 50)}${task.markdown.length > 50 ? '...' : ''}`,
    desc: `${locationDesc}${scheduleInfo}${deadlineInfo}`,
  };
};

export const getCraftTaskAllowedValues = (
  scope: 'active' | 'upcoming' | 'inbox' | 'logbook' = 'inbox'
): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context) => {
    try {
      const { url } = getQoreContextRequiredValues({
        context,
        connectionFields: ['url'],
        ErrorClass: CraftError,
      });

      return await fetchCraftAllowedValues({
        url,
        path: 'tasks',
        method: 'GET',
        params: { scope },
        mapItemToAllowedValue: mapTaskToAllowedValue,
      });
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to fetch Craft task allowed values: ${error}`);
    }
  };
};

export const getCraftInboxTaskAllowedValues = getCraftTaskAllowedValues('inbox');
export const getCraftActiveTaskAllowedValues = getCraftTaskAllowedValues('active');
export const getCraftUpcomingTaskAllowedValues = getCraftTaskAllowedValues('upcoming');
export const getCraftLogbookTaskAllowedValues = getCraftTaskAllowedValues('logbook');
