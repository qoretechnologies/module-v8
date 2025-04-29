import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomContact {
  type: string;
  id: string;
  workspace_id: string;
  external_id?: string;
  role: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  created_at: number;
  updated_at: number;
  signed_up_at?: number;
  last_seen_at?: number;
  last_replied_at?: number;
}

const mapIntercomContactToAllowedValue = (contact: IntercomContact): IQoreAllowedValue<string> => {
  return {
    display_name: contact.name ? `${contact.name} (${contact.email})` : contact.email,
    value: contact.id,
    desc:
      `ID: ${contact.id}\n\n` +
      `Email: ${contact.email}\n\n` +
      `Role: ${contact.role}\n\n` +
      `Created at: ${new Date(contact.created_at * 1000).toISOString()}\n\n` +
      `Last seen: ${contact.last_seen_at ? new Date(contact.last_seen_at * 1000).toISOString() : 'Never'}\n\n` +
      `Last replied: ${contact.last_replied_at ? new Date(contact.last_replied_at * 1000).toISOString() : 'Never'}`,
  };
};

export const getIntercomContactIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom contact IDs');
  }

  return await getIntercomAllowedValues<IntercomContact>({
    token,
    path: '/contacts',
    dataPath: 'data',
    mapFn: mapIntercomContactToAllowedValue,
  });
};
