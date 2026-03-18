import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulScopedClient } from '../client';

export const getContentfulContentTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const spaceId = context?.opts?.space_id;
  const environmentId = context?.opts?.environment_id || 'master';

  if (!context?.conn_opts?.access_token || !spaceId) {
    return [];
  }

  try {
    const client = getContentfulScopedClient(context, spaceId, environmentId);
    const contentTypes = await client.contentType.getMany({
      query: { limit: 1000 },
    });

    return contentTypes.items.map((ct) => ({
      value: ct.sys.id,
      display_name: ct.name,
    }));
  } catch {
    return [];
  }
};
