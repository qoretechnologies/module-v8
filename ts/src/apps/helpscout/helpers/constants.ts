import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get, omit } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { HELPSCOUT_APP_NAME } from '../constants';

export const HELPSCOUT_ALLOWED_VALUES_TIMEOUT = 60_000;
export const HELPSCOUT_ALLOWED_VALUES_FETCH_DELAY = 300;
const HELPSCOUT_PER_PAGE = 200;

type QorusResponse<T> = {
  data: T;
  headers: Record<string, any>;
};

export type THelpScoutRequestOptions = {
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
      _embedded: {
        [key: string]: ItemType[] | any;
      };
    } & {
      page: {
        size: number;
        total_elements: number;
        total_pages: number;
        number: number;
      };
    })
  | ItemType[]
  | any[];

type THelpScoutPaginatedOptions = THelpScoutRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type THelpScoutAllowedValuesOptions<ItemType = unknown> = THelpScoutPaginatedOptions & {
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

export async function helpScoutApiClient<
  ResponseType = {
    data: Record<string, any>;
    headers: Record<string, any>;
  },
>(
  options: THelpScoutRequestOptions & { getHeaderValues: true }
): Promise<{ data: ResponseType; headers: Record<string, any> }>;

export async function helpScoutApiClient<ResponseType = unknown>(
  options: THelpScoutRequestOptions & { getHeaderValues?: false }
): Promise<ResponseType>;

export async function helpScoutApiClient<ResponseType = unknown>(
  options: THelpScoutRequestOptions
): Promise<ResponseType | { data: ResponseType; headers: Record<string, any> }> {
  const { token, path, object, method = 'GET', body, params, getHeaderValues } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: 'https://api.helpscout.net',
    endpointId: HELPSCOUT_APP_NAME,
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
      throw new Error(`No data received from HelpScout API for ${path}`);
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
    Debugger.log(`Error calling HelpScout API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
}

export const fetchHelpScoutPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: THelpScoutPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'GET',
    body,
    path,
    maxResults = 500,
    fetchDelay = HELPSCOUT_ALLOWED_VALUES_FETCH_DELAY,
    timeout = HELPSCOUT_ALLOWED_VALUES_TIMEOUT,
    limit,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let page = 1;
  let totalPages = 1;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching HelpScout records for ${options.path}`);
        break;
      }

      const response: ResponseType = await helpScoutApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          size: limit || HELPSCOUT_PER_PAGE,
          page,
          ...options.params,
        },
        body,
      });

      let objectData: ItemType[] | undefined;

      if (Array.isArray(response)) {
        if (!response.length) break;
        items.push(...response);
        break;
      } else if (response._embedded) {
        objectData = get(response._embedded, object) as ItemType[] | undefined;
      } else {
        objectData = get(response, object) as ItemType[] | undefined;
      }

      if (!objectData?.length) break;
      items.push(...objectData);
      totalPages = response.page?.total_pages || 1;
      page++;
      if (items.length < maxResults && page <= totalPages) {
        await delay(fetchDelay);
      }
    } while (items.length < maxResults && page <= totalPages);
  } catch (error) {
    Debugger.log(`Error fetching paginated helpscout records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchHelpScoutAllowedValues = async <ItemType = unknown>(
  options: THelpScoutAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchHelpScoutPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
