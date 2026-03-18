import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulClient } from '../client';

export const getContentfulSpaceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  if (!context?.conn_opts?.access_token) {
    return [];
  }

  try {
    const client = getContentfulClient(context);
    const spaces = await client.space.getMany({ query: { limit: 100 } });

    return spaces.items.map((space) => ({
      value: space.sys.id,
      display_name: space.name,
    }));
  } catch {
    return [];
  }
};
