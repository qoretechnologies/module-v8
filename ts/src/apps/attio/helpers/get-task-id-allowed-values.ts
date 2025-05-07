import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

interface TAttioTask {
  id: {
    task_id: string;
  };
  content_plaintext: string;
  is_completed: boolean;
  deadline_at: string;
}

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const mapAttioTaskToAllowedValue = (item: TAttioTask): IQoreAllowedValue<string> => ({
  value: item.id.task_id,
  display_name:
    item.content_plaintext.length > 25
      ? `${item.content_plaintext.slice(0, 25)}...`
      : item.content_plaintext,
  desc:
    `ID: ${item.id.task_id}\n` +
    `Completed: ${item.is_completed}\n` +
    `Deadline: ${formatter.format(new Date(item.deadline_at))}\n` +
    `Content: ${item.content_plaintext}`,
});

export const getAttioTaskIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);

    return await getAttioAllowedValues<TAttioTask, string>({
      path: `tasks`,
      token,
      mapItemToAllowedValue: mapAttioTaskToAllowedValue,
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio tasks allowed values: ${error}`);
  }
};
