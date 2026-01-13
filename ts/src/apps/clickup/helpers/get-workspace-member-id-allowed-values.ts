import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { clickUpClient } from '../client';
import { ClickUpError } from '../constants';

type TClickUpItem = {
  user: {
    id: number;
    username: string;
    email: string;
    profilePicture: string;
    role_key: string;
  };
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<number> => {
  const { user } = item;

  return {
    value: user.id,
    display_name: user.username,
    desc: `Email: ${user.email}\nRole: ${user.role_key}`,
    ...(user.profilePicture && { image: user.profilePicture }),
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

  return await clickUpClient.fetchAllowedValues<TClickUpItem>({
    token,
    path: `team/${workspace}`,
    itemsPath: 'team.members',
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
