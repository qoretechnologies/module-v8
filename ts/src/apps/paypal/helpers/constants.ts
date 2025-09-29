import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { PAYPAL_APP_NAME } from '../constants';

export const PAYPAL_ALLOWED_VALUES_TIMEOUT = 60_000;
export const PAYPAL_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TPayPalRequestOptions = {
  token: string;
  object?: string;
  path: string;
  environment: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> = {
  [key: string]: ItemType[] | any;
} & {
  page: number;
  total_pages: number;
};

type TPayPalPaginatedOptions = TPayPalRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TPayPalAllowedValuesOptions<ItemType = unknown> = TPayPalPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const formatPath = (path: string): string => {
  let clean = path.replace(/^\/+|\/+$/g, '');
  if (!clean.startsWith('v1/') && !clean.startsWith('v2/')) {
    clean = `v1/${clean}`;
  }

  return `/${clean}`;
};

export const payPalApiClient = async <ResponseType = unknown>(
  options: TPayPalRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params, environment } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: `https://${environment}.paypal.com`,
    endpointId: PAYPAL_APP_NAME,
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
      case 'DELETE':
        response = await QorusRequest.deleteReq<QorusResponse<ResponseType>>(
          requestConfig,
          endpointData
        );
        break;
    }

    if (!response?.data) {
      throw new Error(`No data received from PayPal API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling PayPal API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchPayPalPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TPayPalPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'items',
    method = 'GET',
    body,
    environment,
    maxResults = 500,
    fetchDelay = PAYPAL_ALLOWED_VALUES_FETCH_DELAY,
    timeout = PAYPAL_ALLOWED_VALUES_TIMEOUT,
    path,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let nextPage = 1;
  let totalPages = 1;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching PayPal records for ${path}`);
        break;
      }

      const response = await payPalApiClient<ResponseType>({
        token,
        path,
        method,
        environment,
        params: {
          ...options.params,
          page: nextPage ? String(nextPage) : '1',
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      items.push(...objectData);

      totalPages = response.total_pages || 1;

      if (items.length < maxResults) {
        nextPage = response.page + 1;
        await delay(fetchDelay);
      } else {
        totalPages = nextPage;
      }
    } while (nextPage < totalPages && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated PayPal records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchPayPalAllowedValues = async <ItemType = unknown>(
  options: TPayPalAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchPayPalPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
