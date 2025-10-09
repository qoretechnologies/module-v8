import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { TODOIST_APP_NAME } from '../constants';

export const TODOIST_ALLOWED_VALUES_TIMEOUT = 60_000;
export const TODOIST_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TTodoistRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> = {
  [key: string]: ItemType[] | any;
} & {
  next_cursor?: string;
};

type TTodoistPaginatedOptions = TTodoistRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TTodoistAllowedValuesOptions<ItemType = unknown> = TTodoistPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const formatPath = (path: string): string => {
  let clean = path.replace(/^\/+|\/+$/g, '');
  if (!clean.startsWith('api/v1/') && !clean.startsWith('api/v2/')) {
    clean = `api/v1/${clean}`;
  }

  return `/${clean}`;
};

export const todoistApiClient = async <ResponseType = unknown>(
  options: TTodoistRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: `https://api.todoist.com`,
    endpointId: TODOIST_APP_NAME,
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
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Todoist API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Todoist API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchTodoistPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TTodoistPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = TODOIST_ALLOWED_VALUES_FETCH_DELAY,
    timeout = TODOIST_ALLOWED_VALUES_TIMEOUT,
    path,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let cursor: string | undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Todoist records for ${path}`);
        break;
      }

      const response = await todoistApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          ...options.params,
          ...(cursor && { cursor }),
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      items.push(...objectData);

      cursor = response.next_cursor;

      if (items.length < maxResults) {
        await delay(fetchDelay);
      } else {
        cursor = undefined;
      }
    } while (cursor && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Todoist records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchTodoistAllowedValues = async <ItemType = unknown>(
  options: TTodoistAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchTodoistPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
