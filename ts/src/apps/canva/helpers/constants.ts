import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CANVA_APP_NAME } from '../constants';

export const CANVA_ALLOWED_VALUES_TIMEOUT = 60_000;
export const CANVA_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TCanvaRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> = {
  [key: string]: ItemType[] | any;
};

type TCanvaPaginatedOptions = TCanvaRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TCanvaAllowedValuesOptions<ItemType = unknown> = TCanvaPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

const endpointData = {
  url: 'https://api.canva.com',
  endpointId: CANVA_APP_NAME,
};
export const canvaApiClient = async <ResponseType = unknown>(
  options: TCanvaRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = path.startsWith('/') ? `/rest/v1${path}` : `/rest/v1/${path}`;

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
      throw new Error(`No data received from Canva API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Canva API for ${path}`, error);
    throw error;
  }
};

export const fetchCanvaPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TCanvaPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'items',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = CANVA_ALLOWED_VALUES_FETCH_DELAY,
    timeout = CANVA_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  let continuation: string | undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Canva records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await canvaApiClient<ResponseType>({
        token,
        path: options.path,
        method,
        params: {
          ...(continuation && { continuation }),
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
        continuation = response.continuation;
        await delay(fetchDelay);
      } else {
        continuation = undefined;
      }
    } while (continuation && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Canva records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchCanvaAllowedValues = async <ItemType = unknown>(
  options: TCanvaAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchCanvaPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
