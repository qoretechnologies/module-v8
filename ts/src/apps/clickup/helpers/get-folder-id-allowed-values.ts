import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { clickUpClient } from '../client';
import { ClickUpError } from '../constants';

type TClickUpItem = {
  id: string;
  name: string;
  hidden: boolean;
  task_count: number;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Hidden: ${item.hidden}\nTask Count: ${item.task_count}`,
  };
};

export const getClickUpFolderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, space } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['space'],
    ErrorClass: ClickUpError,
  });

  return await clickUpClient.fetchAllowedValues<TClickUpItem>({
    token,
    path: `space/${space}/folder`,
    itemsPath: 'folders',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
