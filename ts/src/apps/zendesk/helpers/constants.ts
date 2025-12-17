import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { ZENDESK_APP_NAME } from '../app-constants';

export const ZENDESK_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ZENDESK_ALLOWED_VALUES_FETCH_DELAY = 300;
const ZENDESK_PER_PAGE = 100;

type QorusResponse<T> = {
  data: T;
};

export type TZendeskRequestOptions = {
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
      next_page: string | null;
    })
  | ItemType[]
  | any[];

type TZendeskPaginatedOptions = TZendeskRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TZendeskAllowedValuesOptions<ItemType = unknown> = TZendeskPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');

  if (!clean.startsWith('api/v2/')) {
    clean = `api/v2/${clean}`;
  }

  return `/${clean}`;
};

export const zendeskApiClient = async <ResponseType = unknown>(
  options: TZendeskRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', url, body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url,
    endpointId: ZENDESK_APP_NAME,
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
      throw new Error(`No data received from Zendesk API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Zendesk API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchZendeskPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TZendeskPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'GET',
    url,
    body,
    path,
    maxResults = 500,
    fetchDelay = ZENDESK_ALLOWED_VALUES_FETCH_DELAY,
    timeout = ZENDESK_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let moreRecords = true;
  let page = 1;
  let per_page = options.limit || options.params?.per_page || ZENDESK_PER_PAGE;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Zendesk records for ${options.path}`);
        break;
      }

      const response: ResponseType = await zendeskApiClient<ResponseType>({
        token,
        path,
        url,
        method,
        params: {
          per_page: String(per_page),
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
        moreRecords = response.next_page !== null;
        if (items.length < maxResults && moreRecords) {
          await delay(fetchDelay);
          page++;
        }
      }
    } while (items.length < maxResults && moreRecords);
  } catch (error) {
    Debugger.log(`Error fetching paginated zendesk records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchZendeskAllowedValues = async <ItemType = unknown>(
  options: TZendeskAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchZendeskPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
