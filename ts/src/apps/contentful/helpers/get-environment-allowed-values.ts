import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulClient } from '../client';

export const getContentfulEnvironmentAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const spaceId = context?.opts?.space_id;

  if (!context?.conn_opts?.access_token || !spaceId) {
    return [];
  }

  try {
    const client = getContentfulClient(context);
    const environments = await client.environment.getMany({
      spaceId,
      query: { limit: 100 },
    });

    return environments.items.map((env) => ({
      value: env.sys.id,
      display_name: env.name,
    }));
  } catch {
    return [];
  }
};
