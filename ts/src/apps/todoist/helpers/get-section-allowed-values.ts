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
};

const mapTodoistItemToAllowedValue = (item: TTodoistItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getTodoistSectionAllowedValues: TQoreGetAllowedValuesFunction<
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
    path: `sections`,
    object: 'results',
    mapItemToAllowedValue: mapTodoistItemToAllowedValue,
  });
};
