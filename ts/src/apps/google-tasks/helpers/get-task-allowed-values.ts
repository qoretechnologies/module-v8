import { tasks_v1 } from '@googleapis/tasks';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from './constants';

export const getGoogleTaskAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, taskList } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['taskList'],
    ErrorClass: GoogleTasksError,
  });

  const client = createGoogleTasksClient(token);
  try {
    const initialTasksResponse = await client.tasks.list({
      maxResults: 100,
      tasklist: taskList,
    });

    let nextPageToken = initialTasksResponse.data.nextPageToken;
    const tasks: tasks_v1.Schema$Task[] = initialTasksResponse.data.items || [];

    while (nextPageToken) {
      const response = await client.tasks.list({
        maxResults: 100,
        pageToken: nextPageToken,
        tasklist: taskList,
      });

      tasks.push(...(response.data.items || []));
      nextPageToken = response.data.nextPageToken;
    }

    const allowedValues: IQoreAllowedValue<string>[] =
      tasks.map((item) => {
        return {
          value: item.id!,
          display_name: item.title || 'No title',
          desc:
            `Status: ${item.status || 'No status'}\n` +
            `Completed: ${item.completed ? 'Yes' : 'No'}\n` +
            `Notes: ${item.notes || 'No notes'}`,
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new GoogleTasksError(`Failed to fetch tasks: ${error.message || error}`);
  }
};
