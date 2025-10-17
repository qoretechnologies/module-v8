import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { BASEROW_APP_NAME } from '../constants';

export const BASEROW_ALLOWED_VALUES_TIMEOUT = 60_000;
export const BASEROW_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TBaserowRequestOptions = {
  token: string;
  object?: string;
  path: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> =
  | ({
      [key: string]: ItemType[] | any;
    } & {
      count: number;
      next?: string;
      previous?: string;
    })
  | ItemType[]
  | any[];

type TBaserowPaginatedOptions = TBaserowRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TBaserowAllowedValuesOptions<ItemType = unknown> = TBaserowPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');
  if (!clean.endsWith('/')) {
    clean = `${clean}/`;
  }

  if (!clean.startsWith('api/')) {
    clean = `api/${clean}`;
  }

  return `/${clean}`;
};

export const baserowApiClient = async <ResponseType = unknown>(
  options: TBaserowRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', url, body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url,
    endpointId: BASEROW_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Token ${token}`,
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
      case 'PATCH': {
        const responseData = await axios.patch<QorusResponse<ResponseType>>(
          `${endpointData.url}${requestConfig.path}`,
          requestConfig.data,
          {
            headers: requestConfig.headers,
            params: requestConfig.params,
          }
        );

        response = { data: responseData.data as ResponseType };

        break;
      }

      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Baserow API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Baserow API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchBaserowPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TBaserowPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'GET',
    url,
    body,
    path,
    maxResults = 500,
    fetchDelay = BASEROW_ALLOWED_VALUES_FETCH_DELAY,
    timeout = BASEROW_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let page = 1;
  let count = 0;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Baserow records for ${options.path}`);
        break;
      }

      const response = await baserowApiClient<ResponseType>({
        token,
        path,
        url,
        method,
        params: {
          page: String(page),
          ...options.params,
        },
        body,
      });

      if (Array.isArray(response)) {
        if (!response.length) break;
        items.push(...response);
        break;
      } else {
        const objectData = get(response, object) as ItemType[] | undefined;
        if (!objectData?.length) break;
        items.push(...objectData);
        count = response.count;
        if (items.length < maxResults && items.length < count) {
          await delay(fetchDelay);
          page += 1;
        }
      }
    } while (items.length < maxResults && items.length < count);
  } catch (error) {
    Debugger.log(`Error fetching paginated baserow records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchBaserowAllowedValues = async <ItemType = unknown>(
  options: TBaserowAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchBaserowPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
