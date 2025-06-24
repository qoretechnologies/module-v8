import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { get360MessengerAllowedValues } from './constants';
import { Messenger360Error } from '../constants';

interface IGroup {
  id: string;
  name: string;
}

const mapItemToAllowedValue = (item: IGroup): IQoreAllowedValue<string> => {
  return {
    display_name: item.name,
    value: item.id,
    desc: `Group ID: ${item.id}\n\nGroup Name: ${item.name}`,
  };
};

export const getMessenger360GroupIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Messenger360Error('Token is required to fetch Messenger360 groups');
  }

  return await get360MessengerAllowedValues<IGroup>({
    token,
    path: '/groupChat/getGroupList',
    dataPath: 'data.groups',
    mapFn: mapItemToAllowedValue,
  });
};
