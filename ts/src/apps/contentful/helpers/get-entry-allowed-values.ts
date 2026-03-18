import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getContentfulScopedClient } from '../client';
import { getDefaultLocale } from './contentful-type-mapping';

export const getContentfulEntryAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const spaceId = context?.opts?.space_id;
  const environmentId = context?.opts?.environment_id || 'master';
  const contentTypeId = context?.opts?.content_type_id;

  if (!context?.conn_opts?.access_token || !spaceId) {
    return [];
  }

  try {
    const client = getContentfulScopedClient(context, spaceId, environmentId);
    const defaultLocale = await getDefaultLocale(client, spaceId);

    const query: Record<string, unknown> = { limit: 100 };
    if (contentTypeId) {
      query.content_type = contentTypeId;
    }

    const entries = await client.entry.getMany({ query });

    return entries.items.map((entry) => {
      const fields = entry.fields as Record<string, Record<string, unknown>>;
      const displayField = Object.keys(fields)[0];
      const displayValue = displayField
        ? String(fields[displayField]?.[defaultLocale] || entry.sys.id)
        : entry.sys.id;

      return {
        value: entry.sys.id,
        display_name: displayValue,
      };
    });
  } catch {
    return [];
  }
};
