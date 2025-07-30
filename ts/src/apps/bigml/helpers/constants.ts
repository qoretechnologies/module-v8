import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { BIG_ML_APP_NAME } from '../constants';

export const BIG_ML_ALLOWED_VALUES_TIMEOUT = 60_000;
export const BIG_ML_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TBigMlRequestOptions = {
  token: string;
  username: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  object?: string;
};

type TPaginatedResponse<ItemType = unknown> = {
  meta: {
    next?: string;
    offset?: number;
    total_count?: number;
    limit?: number;
  };
  [key: string]: ItemType[] | any;
};

type TBigMlPaginatedOptions = TBigMlRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TBigMlAllowedValuesOptions<ItemType = unknown> = TBigMlPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const endpointData = {
  url: 'https://bigml.io',
  endpointId: BIG_ML_APP_NAME,
};

export const bigMlApiClient = async <ResponseType = unknown>(
  options: TBigMlRequestOptions
): Promise<ResponseType> => {
  const { token, method = 'GET', body, params = {}, username, object } = options;
  const path = `/andromeda/${options.path}`;

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        'Api-Token': token,
      },
      path,
      params: {
        api_key: token,
        username,
        ...params,
      },
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
      throw new Error(`No data received from BigML API for ${path}`);
    }

    return object ? get(response.data, object) : response.data;
  } catch (error) {
    Debugger.log(`Error calling BigML API for ${path}`, error);
    throw error;
  }
};

export const fetchBigMlPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TBigMlPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'objects',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = BIG_ML_ALLOWED_VALUES_FETCH_DELAY,
    timeout = BIG_ML_ALLOWED_VALUES_TIMEOUT,
    username,
    path,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const limit = options.limit || 100;
  let hasMore = true;
  let offset = 0;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching BigMl records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await bigMlApiClient<ResponseType>({
        token,
        username,
        path,
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

      hasMore = !!response.meta?.next;

      items.push(...objectData);

      if (hasMore) {
        offset += limit;
        await delay(fetchDelay);
      }
    } while (hasMore && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated BigML records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchBigMlAllowedValues = async <ItemType = unknown>(
  options: TBigMlAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchBigMlPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
