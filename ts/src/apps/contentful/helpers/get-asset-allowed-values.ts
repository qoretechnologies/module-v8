import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulScopedClient } from '../client';
import { getDefaultLocale } from './contentful-type-mapping';

export const getContentfulAssetAllowedValues: TQoreGetAllowedValuesFunction<
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
    const defaultLocale = await getDefaultLocale(client, spaceId);

    const assets = await client.asset.getMany({ query: { limit: 100 } });

    return assets.items.map((asset) => {
      const fields = asset.fields as Record<string, Record<string, unknown>>;
      const title = fields.title?.[defaultLocale] || fields.title?.[Object.keys(fields.title || {})[0]];

      return {
        value: asset.sys.id,
        display_name: title ? String(title) : asset.sys.id,
      };
    });
  } catch {
    return [];
  }
};
