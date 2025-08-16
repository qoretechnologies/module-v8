import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { FIGMA_APP_NAME } from '../constants';

export const FIGMA_ALLOWED_VALUES_TIMEOUT = 60_000;
export const FIGMA_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TFigmaRequestOptions = {
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
  pagination: {
    prev_page?: string;
    next_page?: string;
  };
};

type TFigmaPaginatedOptions = TFigmaRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TFigmaAllowedValuesOptions<ItemType = unknown> = TFigmaPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const endpointData = {
  url: 'https://api.figma.com',
  endpointId: FIGMA_APP_NAME,
};
const formatPath = (path: string): string => {
  let clean = path.replace(/^\/+|\/+$/g, '');
  if (!clean.startsWith('v1/')) {
    clean = `v1/${clean}`;
  }

  return `/${clean}`;
};

export const figmaApiClient = async <ResponseType = unknown>(
  options: TFigmaRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = formatPath(path);

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
      throw new Error(`No data received from Figma API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Figma API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchFigmaPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TFigmaPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'items',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = FIGMA_ALLOWED_VALUES_FETCH_DELAY,
    timeout = FIGMA_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let nextPage: string | undefined;

  try {
    do {
      const path = nextPage ? new URL(nextPage).pathname : options.path;

      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Figma records for ${options.path}`);
        break;
      }

      const response = await figmaApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          ...options.params,
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      items.push(...objectData);

      if (items.length < maxResults) {
        nextPage = response.pagination.next_page;
        await delay(fetchDelay);
      } else {
        nextPage = undefined;
      }
    } while (nextPage && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Figma records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchFigmaAllowedValues = async <ItemType = unknown>(
  options: TFigmaAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchFigmaPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
