import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotUser = {
  id: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotUser = (user: THubspotUser): IQoreAllowedValue<string> => ({
  value: user.id,
  display_name: user.id,
  short_desc: `Archived: ${user.archived}\n\nCreated at: ${user.createdAt}\n\nUpdated at: ${user.updatedAt}`,
});

export const getHubspotUserAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot user allowed values');
  }

  const users = await fetchHubspotAllowedValues<THubspotUser>({
    token,
    object: 'users',
    mapItemToAllowedValue: mapHubspotUser,
  });

  return users;
};
