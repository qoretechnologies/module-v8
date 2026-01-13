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
  avatar: string;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    ...(item.avatar && { image: item.avatar }),
  };
};

export const getClickUpWorkspaceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  return await clickUpClient.fetchAllowedValues<TClickUpItem>({
    token,
    path: 'team',
    itemsPath: 'teams',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
