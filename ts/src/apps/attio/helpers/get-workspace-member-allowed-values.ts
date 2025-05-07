import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';
import { getAttioAllowedValues, getAttioTokenRequired } from './constants';

interface TAttioWorkspaceMember {
  id: {
    workspace_id: string;
    workspace_member_id: string;
  };
  first_name: string;
  last_name: string;
  avatar_url: string;
  email_address: string;
  access_level: string;
}

const createAttioWorkspaceMemberToAllowedValueMapFunction =
  (valueField: 'id' | 'email') =>
  (item: TAttioWorkspaceMember): IQoreAllowedValue<string> => ({
    value: valueField === 'id' ? item.id.workspace_member_id : item.email_address,
    display_name: `${item.first_name} ${item.last_name}`,
    ...(item.avatar_url && { image: item.avatar_url }),
    desc: `Email: ${item.email_address}\n` + `Access Level: ${item.access_level}`,
  });

export const getAttioWorkspaceMemberIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);

    return await getAttioAllowedValues<TAttioWorkspaceMember, string>({
      path: `workspace_members`,
      token,
      mapItemToAllowedValue: createAttioWorkspaceMemberToAllowedValueMapFunction('id'),
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio workspace members allowed values: ${error}`);
  }
};

export const getAttioWorkspaceMemberEmailAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getAttioTokenRequired(context);

    return await getAttioAllowedValues<TAttioWorkspaceMember, string>({
      path: `workspace_members`,
      token,
      mapItemToAllowedValue: createAttioWorkspaceMemberToAllowedValueMapFunction('email'),
    });
  } catch (error) {
    throw new AttioError(`Failed to get Attio workspace members allowed values: ${error}`);
  }
};
