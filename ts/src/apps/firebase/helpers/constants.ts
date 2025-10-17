import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { FIREBASE_APP_NAME } from '../constants';
import axios from 'axios';

export const FIREBASE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const FIREBASE_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TFirebaseRequestOptions = {
  token: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  baseUrl?: string;
};

type TFirebasePaginatedOptions = TFirebaseRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
  pageTokenKey?: string;
};

type TFirebaseAllowedValuesOptions<ItemType = unknown> = TFirebasePaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const formatPath = (path: string): string => {
  let clean = path.replace(/^\/+|\/+$/g, '');
  return `/${clean}`;
};

const FIREBASE_IDENTITY_TOOLKIT_URL = 'https://identitytoolkit.googleapis.com';
const FIREBASE_FCM_URL = 'https://fcm.googleapis.com';
const FIREBASE_STORAGE_URL = 'https://storage.googleapis.com';
const FIREBASE_IID_URL = 'https://iid.googleapis.com';

export const firebaseApiClient = async <ResponseType = unknown>(
  options: TFirebaseRequestOptions
): Promise<ResponseType> => {
  const {
    token,
    path,
    method = 'GET',
    body,
    params,
    baseUrl = FIREBASE_IDENTITY_TOOLKIT_URL,
  } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: baseUrl,
    endpointId: FIREBASE_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
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
      throw new Error(`No data received from Firebase API for ${path}`);
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Firebase API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchFirebasePaginatedData = async <ItemType = unknown>(
  options: TFirebasePaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    path,
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = FIREBASE_ALLOWED_VALUES_FETCH_DELAY,
    timeout = FIREBASE_ALLOWED_VALUES_TIMEOUT,
    pageTokenKey = 'nextPageToken',
    baseUrl,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let nextPageToken: string | undefined = undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Firebase data for ${path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response: any = await firebaseApiClient<any>({
        token,
        path,
        method,
        params: {
          ...options.params,
          maxResults: String(Math.min(1000, maxResults - items.length)),
          ...(nextPageToken && { pageToken: nextPageToken }),
        },
        body,
        baseUrl,
      });

      const responseItems = response.users || response.topics || response.items || [];

      if (!responseItems.length) {
        break;
      }

      items.push(...(responseItems as unknown as ItemType[]));

      nextPageToken = response[pageTokenKey];

      if (nextPageToken) {
        await delay(fetchDelay);
      }
    } while (nextPageToken && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Firebase data`, error);
    return items;
  }

  return items;
};

export const fetchFirebaseAllowedValues = async <ItemType = unknown>(
  options: TFirebaseAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchFirebasePaginatedData<ItemType>(options);
  return items.map(options.mapItemToAllowedValue);
};

export { FIREBASE_IDENTITY_TOOLKIT_URL, FIREBASE_FCM_URL, FIREBASE_STORAGE_URL, FIREBASE_IID_URL };
