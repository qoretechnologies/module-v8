import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { SENTRY_APP_NAME } from '../constants';

export const SENTRY_ALLOWED_VALUES_TIMEOUT = 60_000;
export const SENTRY_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TSentryRequestOptions = {
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
  links: {
    next?: { url: string; cursor: string; results: string };
  };
};

type TSentryPaginatedOptions = TSentryRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TSentryAllowedValuesOptions<ItemType = unknown> = TSentryPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const parseLinkHeader = (linkHeader: string) => {
  if (!linkHeader) return {};

  const links: Record<string, { url: string; cursor: string; results: string }> = {};

  const parts = linkHeader.split(',');

  parts.forEach((part) => {
    const urlMatch = part.match(/<([^>]+)>/);
    const relMatch = part.match(/rel="([^"]+)"/);
    const cursorMatch = part.match(/cursor="([^"]+)"/);
    const resultsMatch = part.match(/results="([^"]+)"/);

    if (urlMatch && relMatch) {
      const url = urlMatch[1];
      const rel = relMatch[1];

      links[rel] = {
        url,
        cursor: cursorMatch ? cursorMatch[1] : '',
        results: resultsMatch ? resultsMatch[1] : '',
      };
    }
  });

  return links;
};

export const sentryApiClient = async <ResponseType = unknown>(
  options: TSentryRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const endpointData = {
    url: `https://sentry.io`,
    endpointId: SENTRY_APP_NAME,
  };
  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers && { ...options.headers }),
      },
      path,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET':
        const axiosResponse = await axios.get<QorusResponse<ResponseType>>(
          `${endpointData.url}${path}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(options.headers && { ...options.headers }),
            },
            params,
          }
        );

        const linkHeader = axiosResponse.headers['link'];
        const responseData = axiosResponse.data;

        response = {
          data: {
            ...(Array.isArray(responseData) ? { items: responseData } : responseData),
            links: parseLinkHeader(linkHeader),
          },
        } as QorusResponse<ResponseType>;

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
      throw new Error(`No data received from Sentry API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Sentry API for ${endpointData.url}${path}`, error);
    throw error;
  }
};

export const fetchSentryPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TSentryPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'items',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = SENTRY_ALLOWED_VALUES_FETCH_DELAY,
    timeout = SENTRY_ALLOWED_VALUES_TIMEOUT,
    path,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let cursor: string | undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Sentry records for ${path}`);
        break;
      }

      const response = await sentryApiClient<ResponseType>({
        token,
        path,
        method,
        params: {
          ...options.params,
          ...(cursor && { cursor }),
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      items.push(...objectData);

      cursor = response.links?.next?.results === 'true' ? response.links?.next?.cursor : undefined;

      if (items.length < maxResults) {
        await delay(fetchDelay);
      } else {
        cursor = undefined;
      }
    } while (cursor && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Sentry records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchSentryAllowedValues = async <ItemType = unknown>(
  options: TSentryAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchSentryPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
