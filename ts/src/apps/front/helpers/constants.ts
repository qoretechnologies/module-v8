import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get, omit } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { FRONT_APP_NAME } from '../constants';

export const FRONT_ALLOWED_VALUES_TIMEOUT = 60_000;
export const FRONT_ALLOWED_VALUES_FETCH_DELAY = 300;
const FRONT_PER_PAGE = 100;

type QorusResponse<T> = {
  data: T;
  headers: Record<string, any>;
};

export type TFrontRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  getHeaderValues?: boolean;
};

type TPaginatedResponse<ItemType = unknown> =
  | ({
      [key: string]: ItemType[] | any;
      _results: {
        [key: string]: ItemType[] | any;
      };
    } & {
      _pagination: {
        next: string | null;
      };
    })
  | ItemType[]
  | any[];

type TFrontPaginatedOptions = TFrontRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TFrontAllowedValuesOptions<ItemType = unknown> = TFrontPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');

  return `/${clean}`;
};

export async function frontApiClient<
  ResponseType = {
    data: Record<string, any>;
    headers: Record<string, any>;
  },
>(
  options: TFrontRequestOptions & { getHeaderValues: true }
): Promise<{ data: ResponseType; headers: Record<string, any> }>;

export async function frontApiClient<ResponseType = unknown>(
  options: TFrontRequestOptions & { getHeaderValues?: false }
): Promise<ResponseType>;

export async function frontApiClient<ResponseType = unknown>(
  options: TFrontRequestOptions
): Promise<ResponseType | { data: ResponseType; headers: Record<string, any> }> {
  const { token, path, object, method = 'GET', body, params, getHeaderValues } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: 'https://api2.frontapp.com',
    endpointId: FRONT_APP_NAME,
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
        response = await QorusRequest.patch<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Front API for ${path}`);
    }

    if (object) {
      const objectData = get(response.data, object);
      if (getHeaderValues) {
        return { data: objectData, headers: response.headers || {} };
      }

      return get(omit(response.data, ['_links']), object) as ResponseType;
    }

    if (getHeaderValues) {
      return {
        data: omit(response.data, ['_links']) as ResponseType,
        headers: response.headers || {},
      };
    }

    return omit(response.data, ['_links']) as ResponseType;
  } catch (error) {
    Debugger.log(`Error calling Front API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
}

export const fetchFrontPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TFrontPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = '_results',
    method = 'GET',
    body,
    path,
    maxResults = 500,
    fetchDelay = FRONT_ALLOWED_VALUES_FETCH_DELAY,
    timeout = FRONT_ALLOWED_VALUES_TIMEOUT,
    limit,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let page_token: string | undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Front records for ${options.path}`);
        break;
      }

      const response: ResponseType = await frontApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          size: limit || FRONT_PER_PAGE,
          ...(page_token && { page_token }),
          ...options.params,
        },
        body,
      });

      let objectData: ItemType[] | undefined;

      if (Array.isArray(response)) {
        if (!response.length) break;
        items.push(...response);
        break;
      } else {
        objectData = get(response, object) as ItemType[] | undefined;
      }

      if (!objectData?.length) break;
      items.push(...objectData);

      const nextUrl: string | null = get(response, '_pagination.next', null);
      if (nextUrl) {
        const urlObj = new URL(nextUrl);
        page_token = urlObj.searchParams.get('page_token') || undefined;
      } else {
        page_token = undefined;
      }
      if (items.length < maxResults && page_token) {
        await delay(fetchDelay);
      }
    } while (items.length < maxResults && page_token);
  } catch (error) {
    Debugger.log(`Error fetching paginated front records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchFrontAllowedValues = async <ItemType = unknown>(
  options: TFrontAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchFrontPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
