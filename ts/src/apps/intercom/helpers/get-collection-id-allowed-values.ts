import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomCollection {
  type: string;
  id: string;
  name: string;
  description?: string;
  created_at: number;
  updated_at: number;
  url?: string;
  parent_id?: string;
  localized?: boolean;
}

const mapIntercomCollectionToAllowedValue = (
  collection: IntercomCollection
): IQoreAllowedValue<string> => {
  return {
    display_name: collection.name,
    value: collection.id,
    desc:
      `ID: ${collection.id}\n\n` +
      `Name: ${collection.name}\n\n` +
      `Description: ${collection.description || 'No description'}\n\n` +
      `Created at: ${new Date(collection.created_at * 1000).toISOString()}\n\n` +
      `Updated at: ${new Date(collection.updated_at * 1000).toISOString()}`,
  };
};

export const getIntercomCollectionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom collections');
  }

  return await getIntercomAllowedValues<IntercomCollection>({
    token,
    path: '/help_center/collections',
    dataPath: 'data',
    mapFn: mapIntercomCollectionToAllowedValue,
  });
};
