import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveUserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

const mapPipedriveUser = (user: TPipedriveUserData): IQoreAllowedValue<string> => ({
  display_name: user.name,
  value: user.id,
  desc: `Email: ${user.email}\n\nPhone: ${user.phone}\n\n`,
});

export const getPipedriveUserIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive user allowed values');
  }

  const users = await fetchPipedriveAllowedValues<TPipedriveUserData>({
    token,
    mapItemToAllowedValue: mapPipedriveUser,
    path: 'v1/users',
  });

  return users;
};
