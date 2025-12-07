import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { AttioEndpointData } from '../constants';

export const ATTIO_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ATTIO_ALLOWED_VALUES_FETCH_DELAY = 300;
const ATTIO_PER_PAGE = 50;

type QorusResponse<T> = {
  data: T;
};

export type TAttioRequestOptions = {
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
      pagination: {
        next_cursor?: string;
      };
    })
  | ItemType[]
  | any[];

type TAttioPaginatedOptions = TAttioRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TAttioAllowedValuesOptions<ItemType = unknown> = TAttioPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');

  if (!clean.startsWith('v2/')) {
    clean = `v2/${clean}`;
  }

  return `/${clean}`;
};

export const attioApiClient = async <ResponseType = unknown>(
  options: TAttioRequestOptions
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
        response = await QorusRequest.get<QorusResponse<ResponseType>>(
          requestConfig,
          AttioEndpointData
        );

        break;
      case 'POST':
        response = await QorusRequest.post<QorusResponse<ResponseType>>(
          requestConfig,
          AttioEndpointData
        );
        break;
      case 'PUT':
        response = await QorusRequest.put<QorusResponse<ResponseType>>(
          requestConfig,
          AttioEndpointData
        );
        break;
      case 'PATCH': {
        const responseData = await axios.patch<QorusResponse<ResponseType>>(
          `${AttioEndpointData.url}${requestConfig.path}`,
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
          AttioEndpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from Attio API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Attio API for ${AttioEndpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchAttioPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TAttioPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'data',
    method = 'GET',
    body,
    path,
    maxResults = 500,
    fetchDelay = ATTIO_ALLOWED_VALUES_FETCH_DELAY,
    timeout = ATTIO_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let cursor: string | undefined;
  let currentPage = 1;
  let moreRecords = true;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Attio records for ${options.path}`);
        break;
      }

      const response: ResponseType = await attioApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          limit: String(ATTIO_PER_PAGE),
          ...(cursor && { cursor }),
          ...(!cursor &&
            currentPage > 1 && {
              offset: ((currentPage - 1) * ATTIO_PER_PAGE).toString(),
            }),
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

        if (response.pagination) {
          moreRecords = Boolean(response?.pagination?.next_cursor) ?? false;
        } else {
          moreRecords = objectData?.length === ATTIO_PER_PAGE;
          currentPage++;
        }
        if (items.length < maxResults && moreRecords) {
          await delay(fetchDelay);
          cursor = response?.pagination?.next_cursor;
        }
      }
    } while (items.length < maxResults && moreRecords);
  } catch (error) {
    Debugger.log(`Error fetching paginated attio records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchAttioAllowedValues = async <ItemType = unknown>(
  options: TAttioAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchAttioPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
