import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulScopedClient } from '../client';

export const getContentfulFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const spaceId = context?.opts?.space_id;
  const environmentId = context?.opts?.environment_id || 'master';
  const contentTypeId = context?.opts?.content_type_id;

  if (!context?.conn_opts?.access_token || !spaceId || !contentTypeId) {
    return [];
  }

  try {
    const client = getContentfulScopedClient(context, spaceId, environmentId);
    const contentType = await client.contentType.get({ contentTypeId });

    return contentType.fields.map((field) => ({
      value: field.id,
      display_name: field.name,
    }));
  } catch {
    return [];
  }
};
