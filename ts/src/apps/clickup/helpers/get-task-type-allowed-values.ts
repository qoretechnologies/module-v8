import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { clickUpClient } from '../client';
import { ClickUpError } from '../constants';

type TClickUpItem = {
  id: number;
  name: string;
  description: string;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    short_desc: item.description,
  };
};

export const getClickUpTaskTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const workspace = context?.opts?.workspace || context?.opts?.team || context?.opts?.team_id;

  return await clickUpClient.fetchAllowedValues<TClickUpItem>({
    token,
    path: `team/${workspace}/custom_item`,
    itemsPath: 'custom_items',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
