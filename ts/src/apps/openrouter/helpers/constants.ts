import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { OPEN_ROUTER_APP_NAME } from '../constants';

export const OPEN_ROUTER_ALLOWED_VALUES_TIMEOUT = 60_000;
export const OPEN_ROUTER_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TOpenRouterRequestOptions = {
  object?: string;
  token: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
};

type TPaginatedResponse<ItemType = unknown> = {
  [key: string]: ItemType[] | any;
};

type TOpenRouterPaginatedOptions = TOpenRouterRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

const endpointData = {
  url: 'https://openrouter.ai',
  endpointId: OPEN_ROUTER_APP_NAME,
};

type TOpenRouterAllowedValuesOptions<ItemType = unknown> = TOpenRouterPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

export const openRouterApiClient = async <ResponseType = unknown>(
  options: TOpenRouterRequestOptions
): Promise<ResponseType> => {
  const { token, method = 'GET', body, params, object } = options;
  const path = `/api/v1/${options.path}`;

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path,
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
      throw new Error(`No data received from Active Campaign API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Active Campaign API for ${path}`, error);
    throw error;
  }
};

export const fetchOpenRouterPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TOpenRouterPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'data',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = OPEN_ROUTER_ALLOWED_VALUES_FETCH_DELAY,
    timeout = OPEN_ROUTER_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const limit = options.limit || 100;
  let total = 0;
  let offset = 0;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Open Router records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await openRouterApiClient<ResponseType>({
        token,
        path: options.path,
        method,
        params: {
          offset: offset.toString(),
          limit: limit.toString(),
          ...options.params,
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      total = response.meta?.total || 0;

      items.push(...objectData);

      if (items.length < total) {
        offset += limit;
        await delay(fetchDelay);
      }
    } while (items.length < total && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Open Router records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchOpenRouterAllowedValues = async <ItemType = unknown>(
  options: TOpenRouterAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchOpenRouterPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );

  return items.map(options.mapItemToAllowedValue);
};
