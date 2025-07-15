import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ClickUpError } from '../constants';
import { fetchClickUpAllowedValues } from './constants';

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
    const folderLists = await fetchClickUpAllowedValues<TClickUpItem>({
      token,
      path: `folder/${folder}/list`,
      object: 'lists',
      mapItemToAllowedValue: mapClickUpItemToAllowedValue,
    });

    items.push(...folderLists);
  }

  if (space) {
    const spaceLists = await fetchClickUpAllowedValues<TClickUpItem>({
      token,
      path: `space/${space}/list`,
      object: 'lists',
      mapItemToAllowedValue: mapClickUpItemToAllowedValue,
    });

    items.push(...spaceLists);
  }

  return items;
};
