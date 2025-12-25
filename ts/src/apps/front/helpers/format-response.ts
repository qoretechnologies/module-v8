import { omit } from 'lodash';

type TFrontResponseObject = Record<string, any>;

export function formatFrontResponse<T extends TFrontResponseObject>(data: T): T;
export function formatFrontResponse<T extends TFrontResponseObject>(data: T[]): T[];
export function formatFrontResponse<T extends TFrontResponseObject>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return data.map((item) => formatSingleObject(item));
  }

  return formatSingleObject(data);
}

function formatSingleObject<T extends TFrontResponseObject>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const { _embedded, ...rest } = omit(obj, ['_links']) as T & { _embedded?: Record<string, any> };

  const processed: Record<string, any> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (Array.isArray(value)) {
      processed[key] = value.map((item) =>
        item && typeof item === 'object' ? formatSingleObject(item) : item
      );
    } else if (value && typeof value === 'object') {
      processed[key] = formatSingleObject(value);
    } else {
      processed[key] = value;
    }
  }

  if (_embedded && typeof _embedded === 'object') {
    const processedEmbedded = formatSingleObject(_embedded);
    return {
      ...processed,
      ...processedEmbedded,
    } as T;
  }

  return processed as T;
}
