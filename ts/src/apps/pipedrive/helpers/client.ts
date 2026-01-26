import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { PIPEDRIVE_APP_NAME } from '../base-constants';

export const PIPEDRIVE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY = 300;
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

type TPaginatedResponse<ItemType = unknown> =
  | ({
      [key: string]: ItemType[] | any;
    } & {
      next_cursor?: string;
      additional_data?: {
        next_cursor?: string;
        pagination?: {
          more_items_in_collection?: boolean;
          next_start?: number;
        };
      };
    })
  | ItemType[]
  | any[];

type TPipedrivePaginatedOptions = TPipedriveRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TPipedriveAllowedValuesOptions<ItemType = unknown> = TPipedrivePaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let formattedPath = path.trim().replace(/^\/+/, '');

  if (!formattedPath.startsWith('api/v2') && !formattedPath.startsWith('v1')) {
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

export const fetchPipedrivePaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TPipedrivePaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'data',
    method = 'GET',
    body,
    path,
    maxResults = 500,
    fetchDelay = PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY,
    timeout = PIPEDRIVE_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let cursor: string | undefined;
  let moreRecords = true;
  let start = 0;

  let useCursorPagination = true;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Pipedrive records for ${options.path}`);
        break;
      }

      const response: ResponseType = await pipedriveApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          limit: String(PIPEDRIVE_PER_PAGE),
          ...options.params,
          ...(useCursorPagination
            ? {
                ...(cursor && { cursor }),
              }
            : { start: String(start) }),
        },
        body,
      });

      if (Array.isArray(response)) {
        if (!response.length) break;
        items.push(...response);
        break;
      } else {
        if (response?.additional_data?.pagination) {
          useCursorPagination = false;
        }

        const objectData = get(response, object) as ItemType[] | undefined;
        if (!objectData?.length) break;
        items.push(...objectData);

        moreRecords = useCursorPagination
          ? Boolean(response?.next_cursor)
          : Boolean(response?.additional_data?.pagination?.more_items_in_collection);

        if (items.length < maxResults && moreRecords) {
          await delay(fetchDelay);
          cursor = response?.next_cursor;
          if (!useCursorPagination) {
            start += objectData.length;
          }
        }
      }
    } while (items.length < maxResults && moreRecords);
  } catch (error) {
    Debugger.log(`Error fetching paginated pipedrive records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchPipedriveAllowedValues = async <ItemType = unknown>(
  options: TPipedriveAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchPipedrivePaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );
  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
