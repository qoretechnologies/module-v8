import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ConfluenceError } from '../constants';
import { fetchConfluenceAllowedValues } from './constants';
import { parse } from 'node-html-parser';

type TConfluenceTask = {
  id: string;
  status: string;
  body?: {
    value: string;
  };
};

const mapConfluenceTaskToAllowedValue = (task: TConfluenceTask): IQoreAllowedValue<string> => {
  const bodyContent = task.body?.value ? parse(task.body.value).text : '';
  const title = bodyContent.length > 10 ? bodyContent.slice(0, 10) + '...' : bodyContent;

  return {
    value: task.id,
    display_name: title || `Task ${task.id}`,
    desc: `Status: ${task.status}\nBody: ${bodyContent}`,
  };
};

export const getConfluenceTaskIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { cloud_id, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['cloud_id', 'token'],
    ErrorClass: ConfluenceError,
  });

  return await fetchConfluenceAllowedValues<TConfluenceTask>({
    token,
    cloudId: cloud_id,
    path: '/tasks',
    mapItemToAllowedValue: mapConfluenceTaskToAllowedValue,
  });
};
