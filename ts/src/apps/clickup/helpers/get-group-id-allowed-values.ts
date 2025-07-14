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
  members: [];
  avatar: {
    attachment?: {
      url: string;
    };
  };
};

const mapClickUpItemToAllowedValue = (item: TClickUpItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Member Count: ${item.members.length}`,
    ...(item.avatar?.attachment?.url && { image: item.avatar.attachment.url }),
  };
};

export const getClickUpGroupIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ClickUpError,
  });

  const workspace = context?.opts?.workspace || context?.opts?.team || context?.opts?.team_id;

  return await fetchClickUpAllowedValues<TClickUpItem>({
    token,
    path: `group`,
    object: 'groups',
    params: {
      team_id: workspace,
    },
    mapItemToAllowedValue: mapClickUpItemToAllowedValue,
  });
};
