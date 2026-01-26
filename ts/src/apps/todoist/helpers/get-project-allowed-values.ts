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
  name: string;
  description?: string;
};

const mapTodoistItemToAllowedValue = (item: TTodoistItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    ...(item.description && { short_desc: item.description }),
  };
};

export const getTodoistProjectAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: `projects`,
    object: 'results',
    mapItemToAllowedValue: mapTodoistItemToAllowedValue,
  });
};
