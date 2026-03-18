import { ContentfulError } from '../constants';

const localeCache = new Map<string, string>();

/**
 * Fetches and caches the default locale for a space.
 */
export const getDefaultLocale = async (
  client: { locale: { getMany: (params: Record<string, unknown>) => Promise<{ items: Array<{ default: boolean; code: string }> }> } },
  spaceId: string
): Promise<string> => {
  const cached = localeCache.get(spaceId);
  if (cached) {
    return cached;
  }

  try {
    const locales = await client.locale.getMany({ query: { limit: 100 } });
    const defaultLocale = locales.items.find((l) => l.default);
    const code = defaultLocale?.code || 'en-US';
    localeCache.set(spaceId, code);
    return code;
  } catch (error) {
    throw new ContentfulError(`Failed to fetch locales: ${error}`);
  }
};

/**
 * Flattens Contentful locale-wrapped fields to a simple key-value object.
 * { title: { 'en-US': 'Hello' } } → { title: 'Hello' }
 */
export const flattenEntryFields = (
  fields: Record<string, Record<string, unknown>>,
  defaultLocale: string
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, localeValues] of Object.entries(fields)) {
    if (localeValues && typeof localeValues === 'object') {
      result[key] = localeValues[defaultLocale] ?? Object.values(localeValues)[0];
    } else {
      result[key] = localeValues;
    }
  }

  return result;
};

/**
 * Wraps simple key-value fields with the locale structure.
 * { title: 'Hello' } → { title: { 'en-US': 'Hello' } }
 */
export const wrapFieldsWithLocale = (
  fields: Record<string, unknown>,
  defaultLocale: string
): Record<string, Record<string, unknown>> => {
  const result: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) {
      result[key] = { [defaultLocale]: value };
    }
  }

  return result;
};

/**
 * Flattens a full Contentful entry into a flat object with sys metadata.
 */
export const flattenEntry = <
  T extends {
    sys: { id: string; createdAt: string; updatedAt: string; version: number; contentType?: { sys: { id: string } } };
    fields: Record<string, Record<string, unknown>>;
  },
>(
  entry: T,
  defaultLocale: string
): Record<string, unknown> => {
  return {
    id: entry.sys.id,
    content_type: entry.sys.contentType?.sys?.id,
    created_at: entry.sys.createdAt,
    updated_at: entry.sys.updatedAt,
    version: entry.sys.version,
    ...flattenEntryFields(entry.fields, defaultLocale),
  };
};

/**
 * Flattens a full Contentful asset into a flat object.
 */
export const flattenAsset = <
  T extends {
    sys: { id: string; createdAt: string; updatedAt: string; version: number };
    fields: Record<string, Record<string, unknown>>;
  },
>(
  asset: T,
  defaultLocale: string
): Record<string, unknown> => {
  const fields = flattenEntryFields(asset.fields, defaultLocale);
  const file = fields.file as Record<string, unknown> | undefined;

  return {
    id: asset.sys.id,
    created_at: asset.sys.createdAt,
    updated_at: asset.sys.updatedAt,
    version: asset.sys.version,
    title: fields.title,
    description: fields.description,
    file_name: file?.fileName,
    content_type: file?.contentType,
    url: file?.url ? `https:${file.url}` : undefined,
    size: (file?.details as Record<string, unknown>)?.size,
  };
};

/**
 * Maps Contentful field types to Qore types.
 */
export const mapContentfulFieldTypeToQoreType = (
  fieldType: string
): { type: string; fields?: Record<string, { type: string; short_desc?: string }> } => {
  switch (fieldType) {
    case 'Symbol':
    case 'Text':
    case 'RichText':
      return { type: 'string' };
    case 'Integer':
      return { type: 'int' };
    case 'Number':
      return { type: 'float' };
    case 'Date':
      return { type: 'date' };
    case 'Boolean':
      return { type: 'bool' };
    case 'Location':
      return {
        type: 'hash',
        fields: {
          lat: { type: 'float', short_desc: 'Latitude' },
          lon: { type: 'float', short_desc: 'Longitude' },
        },
      };
    case 'Object':
      return { type: 'hash' };
    case 'Link':
      return { type: 'string' };
    case 'Array':
      return { type: 'list' };
    default:
      return { type: 'string' };
  }
};
