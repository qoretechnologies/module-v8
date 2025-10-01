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
  email: string;
};

const mapTodoistItemToAllowedValue = (item: TTodoistItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: `${item.name} <${item.email}>`,
  };
};

export const getTodoistCollaboratorAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, project_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id'],
    ErrorClass: TodoistError,
  });

  return await fetchTodoistAllowedValues<TTodoistItem>({
    token,
    path: `projects/${project_id}/collaborators`,
    object: 'results',
    mapItemToAllowedValue: mapTodoistItemToAllowedValue,
  });
};
