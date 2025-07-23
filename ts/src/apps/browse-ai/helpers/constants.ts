import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { BROWSE_AI_APP_NAME } from '../constants';

export const BROWSE_AI_ALLOWED_VALUES_TIMEOUT = 60_000;
export const BROWSE_AI_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TBrowseAiRequestOptions = {
  token: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  object?: string;
};

type TPaginatedResponse<ItemType = unknown> = {
  result: {
    [key: string]: { items: ItemType[]; totalCount: number; pageNumber: number; hasMore: boolean };
  };
};

type TBrowseAiPaginatedOptions = TBrowseAiRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TBrowseAiAllowedValuesOptions<ItemType = unknown> = TBrowseAiPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const endpointData = {
  url: 'https://api.browse.ai',
  endpointId: BROWSE_AI_APP_NAME,
};

export const browseAiApiClient = async <ResponseType = unknown>(
  options: TBrowseAiRequestOptions
): Promise<ResponseType> => {
  const { token, method = 'GET', body, params, object } = options;
  const path = `/v2/${options.path}`;

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
      throw new Error(`No data received from Browse AI API for ${path}`);
    }

    if (object) {
      return get(response.data, object);
    }

    return response.data;
  } catch (error) {
    console.dir(error, { depth: null });
    Debugger.log(`Error calling Browse AI API for ${path}`, error);
    throw error;
  }
};

export const fetchBrowseAiPaginatedRecords = async <
  ResponseType extends { result: any } = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TBrowseAiPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'data',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = BROWSE_AI_ALLOWED_VALUES_FETCH_DELAY,
    timeout = BROWSE_AI_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const pageSize = options.limit || 10;
  let hasMore = false;
  let page = 1;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Browse AI records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await browseAiApiClient<ResponseType['result']>({
        token,
        path: options.path,
        method,
        object: 'result',
        params: {
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...options.params,
        },
        body,
      });

      const objectData = get(response, `${object}.items`) as unknown as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      hasMore = get(response, object).hasMore || false;

      items.push(...objectData);

      if (hasMore) {
        page += 1;
        await delay(fetchDelay);
      }
    } while (hasMore && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Browse Ai records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchBrowseAiAllowedValues = async <ItemType = unknown>(
  options: TBrowseAiAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchBrowseAiPaginatedRecords<TPaginatedResponse<ItemType>>(options);

  return items.map(options.mapItemToAllowedValue);
};
