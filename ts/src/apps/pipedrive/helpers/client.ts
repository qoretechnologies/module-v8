// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { Debugger } from '../../../utils/Debugger';
import { PIPEDRIVE_APP_NAME } from '../base-constants';

export const PIPEDRIVE_ALLOWED_VALUES_TIMEOUT = 60_000;
const PIPEDRIVE_PER_PAGE = 100;

type QorusResponse<T> = {
  data: T;
};

export type TPipedriveRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> = {
  data?: ItemType[] | null;
  next_cursor?: string | null;
  additional_data?: {
    next_cursor?: string | null;
    pagination?: { more_items_in_collection?: boolean; next_start?: number };
  };
} | ItemType[];

type TPipedrivePaginatedOptions = TPipedriveRequestOptions & {
  limit?: number;
  maxResults?: number;
  timeout?: number;
};

type TPipedriveAllowedValuesOptions<ItemType = unknown> = TPipedrivePaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let formattedPath = path.trim().replace(/^\/+/, '');

  if (!/^(api\/v2|v1)(\/|$)/.test(formattedPath)) {
    formattedPath = `api/v2/${formattedPath}`;
  }

  return `/${formattedPath}`;
};

export const pipedriveApiClient = async <ResponseType = unknown>(
  options: TPipedriveRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: 'https://api.pipedrive.com',
    endpointId: PIPEDRIVE_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers && { ...options.headers }),
      },
      path: formattedPath,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET':
        response = await QorusRequest.get<QorusResponse<ResponseType>>(requestConfig, endpointData);
        break;
      case 'POST':
        response = await QorusRequest.post<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
      case 'PUT':
        response = await QorusRequest.put<QorusResponse<ResponseType>>(requestConfig, endpointData);
        break;
      case 'PATCH':
        response = await QorusRequest.patch<QorusResponse<ResponseType>>(requestConfig, endpointData);
        break;

      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Pipedrive API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Pipedrive API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

/** Iterate v2 cursor or v1 offset pages. Failures never masquerade as complete results. */
export async function* pipedriveRecordPages<ItemType = unknown>(
  options: TPipedrivePaginatedOptions
): AsyncGenerator<ItemType[]> {
  const { object = 'data', maxResults = 500, timeout = PIPEDRIVE_ALLOWED_VALUES_TIMEOUT } = options;
  const limit = options.limit ?? PIPEDRIVE_PER_PAGE;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500
      || !Number.isSafeInteger(maxResults) || maxResults < 0 || !Number.isFinite(timeout) || timeout <= 0) {
    throw new Error('Invalid Pipedrive pagination limits');
  }
  let deadline = Date.now() + timeout;
  let cursor: string | undefined;
  let start: number | undefined;
  let count = 0;
  const seen = new Set<string>();
  while (count < maxResults) {
    if (Date.now() >= deadline) {
      throw new Error('Pipedrive pagination timed out');
    }
    const response = await pipedriveApiClient<TPaginatedResponse<ItemType>>({
      ...options, object: undefined,
      params: { ...options.params, limit: String(Math.min(limit, maxResults - count)),
        ...(cursor !== undefined ? { cursor } : {}), ...(start !== undefined ? { start: String(start) } : {}) },
    });
    const records = Array.isArray(response) ? response : get(response, object);
    if (records !== null && !Array.isArray(records)) {
      throw new Error('Invalid Pipedrive pagination response: expected records');
    }
    const page = (records || []).slice(0, maxResults - count) as ItemType[];
    count += page.length;
    let more = false;
    if (!Array.isArray(response)) {
      const next = response.additional_data?.next_cursor ?? response.next_cursor;
      const pagination = response.additional_data?.pagination;
      if (next !== undefined && next !== null && next !== '') {
        if (typeof next !== 'string' || seen.has(`cursor:${next}`)) {
          throw new Error('Invalid Pipedrive pagination cursor');
        }
        seen.add(`cursor:${next}`); cursor = next; start = undefined; more = true;
      } else if (pagination?.more_items_in_collection) {
        const nextStart = pagination.next_start;
        if (!Number.isSafeInteger(nextStart) || nextStart! <= (start ?? 0) || seen.has(`start:${nextStart}`)) {
          throw new Error('Invalid Pipedrive pagination offset');
        }
        seen.add(`start:${nextStart}`); start = nextStart; cursor = undefined; more = true;
      }
    }
    if (page.length) {
      const yielded = Date.now();
      yield page;
      // A record consumer can process a block for an arbitrary time between calls.
      // Only fetching pages consumes the pagination budget.
      deadline += Date.now() - yielded;
    }
    if (!more) {
      return;
    }
  }
}

export const fetchPipedrivePaginatedRecords = async <ItemType = unknown>(options: TPipedrivePaginatedOptions): Promise<ItemType[]> => {
  const items: ItemType[] = [];
  for await (const page of pipedriveRecordPages<ItemType>(options)) {
    items.push(...page);
  }
  return items;
};

export const fetchPipedriveAllowedValues = async <ItemType = unknown>(
  options: TPipedriveAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchPipedrivePaginatedRecords<ItemType>(
    options
  );
  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
