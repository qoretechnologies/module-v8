import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveTaskData = {
  id: string;
  title: string;
  description: string;
  done: number;
};

const mapPipedriveTask = (task: TPipedriveTaskData): IQoreAllowedValue<string> => ({
  display_name: task.title,
  value: task.id,
  desc: `Description: ${task.description}\n\nDone: ${task.done ? 'Yes' : 'No'}`,
});

export const createPipedriveTaskIdAllowedValuesFunction = (
  type: 'all' | 'parent-only'
): TQoreGetAllowedValuesFunction<TCustomConnOptions> => {
  return async (context): Promise<IQoreAllowedValue<string>[]> => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('The token is required to get Pipedrive task allowed values');
    }

    const tasks = await fetchPipedriveAllowedValues<TPipedriveTaskData>({
      token,
      mapItemToAllowedValue: mapPipedriveTask,
      path: 'v1/tasks',
      ...(type === 'parent-only' ? { params: { parent_task_id: 'null' } } : {}),
    });

    return tasks;
  };
};

export const getPipedriveTaskIdAllowedValues = createPipedriveTaskIdAllowedValuesFunction('all');
export const getPipedriveParentTaskIdAllowedValues =
  createPipedriveTaskIdAllowedValuesFunction('parent-only');
