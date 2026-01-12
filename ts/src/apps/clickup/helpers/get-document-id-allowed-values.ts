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
  archived: boolean;
  deleted: boolean;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Archived: ${item.archived}\nDeleted: ${item.deleted}`,
  };
};

export const getClickUpDocumentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, workspace } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace'],
    ErrorClass: ClickUpError,
  });

  return await clickUpClient.fetchAllowedValues<TClickUpItem>({
    token,
    path: clickUpClient.v3(`workspaces/${workspace}/docs`),
    itemsPath: 'docs',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
