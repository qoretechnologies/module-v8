import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { get360MessengerAllowedValues } from './constants';

interface IContact {
  number: string;
  pushname: string;
  isMe: boolean;
}

const mapItemToAllowedValue = (item: IContact): IQoreAllowedValue<string> => {
  return {
    display_name: `${item.number} ${item.pushname || ''}`,
    value: item.number,
    desc:
      `Number: ${item.number}\n\n` +
      `Pushname: ${item.pushname || 'No Pushname'}\n\n` +
      `Is Me: ${item.isMe ? 'Yes' : 'No'}`,
  };
};

export const getMessenger360ContactNumberAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Messenger360 contacts');
  }

  return await get360MessengerAllowedValues<IContact>({
    token,
    path: '/client/getContacts',
    dataPath: 'data.contacts',
    mapFn: mapItemToAllowedValue,
  });
};
