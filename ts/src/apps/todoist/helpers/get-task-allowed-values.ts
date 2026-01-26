import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TodoistError } from '../constants';
import { fetchTodoistAllowedValues } from './constants';

type TTodoistItem = {
  id: string;
  content: string;
  description: string;
  due: {
    date: string;
  };
};

const mapTodoistItemToAllowedValue = (item: TTodoistItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.content,
    desc: `Description: ${item.description || 'N/A'}\n` + `Due Date: ${item.due?.date || 'N/A'}`,
  };
};

export const getTodoistTaskAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: TodoistError,
  });

  return await fetchTodoistAllowedValues<TTodoistItem>({
    token,
    path: `tasks`,
    object: 'results',
    mapItemToAllowedValue: mapTodoistItemToAllowedValue,
  });
};
