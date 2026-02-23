/**
 * Mailchimp Record-Based Helpers Constants
 *
 * Utilities for working with Mailchimp audiences as "tables" and members as "records".
 *
 * Mailchimp hierarchy: Account -> Audience (List) -> Member (Subscriber)
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../../error';
import { fetchMailchimpPaginatedData } from '../constants';

export { MailchimpError };

/**
 * Custom field prefix for merge fields
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Maximum page size for Mailchimp API
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Mailchimp member type from API response
 */
export type TMailchimpMember = {
  id: string;
  email_address: string;
  unique_email_id: string;
  web_id: number;
  email_type: string;
  status: string;
  merge_fields: Record<string, unknown>;
  stats: {
    avg_open_rate: number;
    avg_click_rate: number;
  };
  ip_signup: string;
  timestamp_signup: string;
  ip_opt: string;
  timestamp_opt: string;
  member_rating: number;
  last_changed: string;
  language: string;
  vip: boolean;
  email_client: string;
  location: {
    latitude: number;
    longitude: number;
    gmtoff: number;
    dstoff: number;
    country_code: string;
    timezone: string;
  };
  tags_count: number;
  tags: { id: number; name: string }[];
  list_id: string;
};

/**
 * Mailchimp merge field definition
 */
export type TMailchimpMergeField = {
  merge_id: number;
  tag: string;
  name: string;
  type: string;
  required: boolean;
  default_value: string;
  public: boolean;
};

/**
 * Mailchimp list (audience) type
 */
export type TMailchimpList = {
  id: string;
  name: string;
  stats: {
    member_count: number;
    unsubscribe_count: number;
    cleaned_count: number;
    open_rate: number;
    click_rate: number;
  };
};

// --- Caching ---

type MailchimpMappings = {
  lists: Map<string, string>; // name -> id
  mergeFields: Map<string, TMailchimpMergeField[]>; // listId -> merge fields
};

let mappingsCache: MailchimpMappings | null = null;
let mappingsCacheToken: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheToken = null;
};

/**
 * Ensure the cache is initialized for the given token
 */
const ensureCache = (token: string): MailchimpMappings => {
  if (!mappingsCache || mappingsCacheToken !== token) {
    mappingsCache = {
      lists: new Map(),
      mergeFields: new Map(),
    };
    mappingsCacheToken = token;
  }
  return mappingsCache;
};

/**
 * Fetch and cache all audiences (lists)
 */
export const getMailchimpLists = async (options: {
  token: string;
  datacenter: string;
}): Promise<Map<string, string>> => {
  const { token, datacenter } = options;
  const cache = ensureCache(token);

  if (cache.lists.size > 0) {
    return cache.lists;
  }

  const lists = await fetchMailchimpPaginatedData<TMailchimpList>({
    token,
    datacenter,
    path: 'lists',
    dataPath: 'lists',
  });

  for (const list of lists) {
    cache.lists.set(list.name, list.id);
  }

  return cache.lists;
};

/**
 * Get list ID by name, using cache
 */
export const getListIdByName = async (options: {
  token: string;
  datacenter: string;
  listName: string;
}): Promise<string> => {
  const { token, datacenter, listName } = options;
  const listsMap = await getMailchimpLists({ token, datacenter });
  const listId = listsMap.get(listName);

  if (!listId) {
    throw new MailchimpError(`Audience "${listName}" not found.`);
  }

  return listId;
};

/**
 * Fetch and cache merge fields for a list
 */
export const getMergeFieldsForList = async (options: {
  token: string;
  datacenter: string;
  listId: string;
}): Promise<TMailchimpMergeField[]> => {
  const { token, datacenter, listId } = options;
  const cache = ensureCache(token);

  if (cache.mergeFields.has(listId)) {
    return cache.mergeFields.get(listId)!;
  }

  const mergeFields = await fetchMailchimpPaginatedData<TMailchimpMergeField>({
    token,
    datacenter,
    path: `lists/${listId}/merge-fields`,
    dataPath: 'merge_fields',
  });

  cache.mergeFields.set(listId, mergeFields);
  return mergeFields;
};

// --- Transform utilities ---

/**
 * Transform a Mailchimp member API response to a flat record format.
 */
export const transformMemberToRecord = (member: TMailchimpMember): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: member.id,
    email_address: member.email_address,
    unique_email_id: member.unique_email_id || null,
    web_id: member.web_id,
    email_type: member.email_type || '',
    status: member.status,
    member_rating: member.member_rating,
    language: member.language || '',
    vip: member.vip ?? false,
    email_client: member.email_client || '',
    timestamp_signup: member.timestamp_signup || null,
    timestamp_opt: member.timestamp_opt || null,
    last_changed: member.last_changed || null,
    ip_signup: member.ip_signup || '',
    ip_opt: member.ip_opt || '',
    tags_count: member.tags_count || 0,
    tags: member.tags?.map((t) => t.name).join(', ') || '',
    list_id: member.list_id,
    // Flattened stats
    avg_open_rate: member.stats?.avg_open_rate ?? 0,
    avg_click_rate: member.stats?.avg_click_rate ?? 0,
    // Flattened location
    location_latitude: member.location?.latitude ?? null,
    location_longitude: member.location?.longitude ?? null,
    location_country_code: member.location?.country_code || '',
    location_timezone: member.location?.timezone || '',
  };

  // Flatten merge fields with cf_ prefix
  if (member.merge_fields) {
    for (const [tag, value] of Object.entries(member.merge_fields)) {
      record[`${CUSTOM_FIELD_PREFIX}${tag}`] = value ?? null;
    }
  }

  return record;
};

/**
 * Convert a flat record back to Mailchimp member create/update payload.
 * Extracts cf_* fields into merge_fields object.
 */
export const transformRecordToMemberPayload = (
  record: Record<string, unknown>
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const mergeFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      const tag = key.slice(CUSTOM_FIELD_PREFIX.length);
      mergeFields[tag] = value;
    } else if (key === 'email_address') {
      payload.email_address = value;
    } else if (key === 'status') {
      payload.status = value;
    } else if (key === 'email_type') {
      payload.email_type = value;
    } else if (key === 'language') {
      payload.language = value;
    } else if (key === 'vip') {
      payload.vip = value;
    }
    // Skip read-only fields: id, web_id, stats, location, timestamps, etc.
  }

  if (Object.keys(mergeFields).length > 0) {
    payload.merge_fields = mergeFields;
  }

  return payload;
};

/**
 * Compute subscriber hash (md5 of lowercase email)
 */
export const getSubscriberHash = async (email: string): Promise<string> => {
  const { createHash } = await import('crypto');
  return createHash('md5').update(email.toLowerCase()).digest('hex');
};

// --- API helpers ---

/**
 * Build Mailchimp API endpoint config
 */
export const getMailchimpEndpoint = (datacenter: string) => ({
  url: `https://${datacenter}.api.mailchimp.com`,
  endpointId: 'mailchimp',
});

/**
 * Make a POST request to Mailchimp API
 */
export const mailchimpPost = async <T>(options: {
  token: string;
  datacenter: string;
  path: string;
  body: Record<string, unknown>;
}): Promise<T> => {
  const { token, datacenter, path, body } = options;
  const response = await QorusRequest.post<{ data: T }>(
    {
      path: `/3.0/${path}`,
      headers: { Authorization: `Bearer ${token}` },
      data: body,
    },
    getMailchimpEndpoint(datacenter)
  );

  return response?.data as T;
};

/**
 * Make a PUT request to Mailchimp API
 */
export const mailchimpPut = async <T>(options: {
  token: string;
  datacenter: string;
  path: string;
  body: Record<string, unknown>;
}): Promise<T> => {
  const { token, datacenter, path, body } = options;
  const response = await QorusRequest.put<{ data: T }>(
    {
      path: `/3.0/${path}`,
      headers: { Authorization: `Bearer ${token}` },
      data: body,
    },
    getMailchimpEndpoint(datacenter)
  );

  return response?.data as T;
};

/**
 * Make a DELETE request to Mailchimp API
 */
export const mailchimpDelete = async (options: {
  token: string;
  datacenter: string;
  path: string;
}): Promise<void> => {
  const { token, datacenter, path } = options;
  await QorusRequest.deleteReq(
    {
      path: `/3.0/${path}`,
      headers: { Authorization: `Bearer ${token}` },
    },
    getMailchimpEndpoint(datacenter)
  );
};

/**
 * Normalize `set` parameter into a single flat object of fields to update.
 */
export const normalizeSetToSingleRecord = (
  input: unknown,
  mapColumnFormatToObject: (data: Record<string, unknown>) => Record<string, unknown>[]
): Record<string, unknown> => {
  if (Array.isArray(input)) {
    if (input.length > 1) {
      throw new MailchimpError(
        `Update supports a single record in 'set'; received ${input.length} records.`
      );
    }
    return (input[0] as Record<string, unknown>) || {};
  }

  if (input && typeof input === 'object') {
    const values = Object.values(input);
    const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
    const lengths = allArrays ? values.map((v) => (v as unknown[]).length) : [];
    const sameLength = lengths.length > 0 && new Set(lengths).size === 1;

    if (allArrays && sameLength) {
      const records = mapColumnFormatToObject(input as Record<string, unknown>);
      if (records.length > 1) {
        throw new MailchimpError(
          `Update supports a single record in 'set'; received ${records.length} records.`
        );
      }
      return records[0] || {};
    }

    return input as Record<string, unknown>;
  }

  return {};
};
