import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ClickUpError } from '../constants';
import { fetchClickUpAllowedValues } from './constants';

type TClickUpItem = {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  role_key: string;
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.username,
    desc: `Email: ${item.email}\nRole: ${item.role_key}`,
    ...(item.profilePicture && { image: item.profilePicture }),
  };
};

export const getClickUpWorkspaceMemberIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { token, workspace } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['workspace'],
    ErrorClass: ClickUpError,
  });

  return await fetchClickUpAllowedValues<TClickUpItem>({
    token,
    path: `team/${workspace}`,
    object: 'team.members',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
