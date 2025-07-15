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

  return await fetchClickUpAllowedValues<TClickUpItem>({
    token,
    path: `team`,
    object: 'teams',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
