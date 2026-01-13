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
  task_count: number;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Task Count: ${item.task_count}`,
  };
};

export const getClickUpListIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const { folder, space } = context?.opts || {};

  const items: IQoreAllowedValue<string>[] = [];

  if (folder) {
    const folderLists = await clickUpClient.fetchAllowedValues<TClickUpItem>({
      token,
      path: `folder/${folder}/list`,
      itemsPath: 'lists',
      mapItemToAllowedValue: mapClickUpItemToAllowedValue,
    });

    items.push(...folderLists);
  }

  if (space) {
    const spaceLists = await clickUpClient.fetchAllowedValues<TClickUpItem>({
      token,
      path: `space/${space}/list`,
      itemsPath: 'lists',
      mapItemToAllowedValue: mapClickUpItemToAllowedValue,
    });

    items.push(...spaceLists);
  }

  return items;
};
