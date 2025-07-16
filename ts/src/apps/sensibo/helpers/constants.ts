import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IEndpoint } from '@qoretechnologies/ts-toolkit/dist/QorusAuthenticator';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { SENSIBO_APP_NAME } from '../constants';

export const SENSIBO_ALLOWED_VALUES_TIMEOUT = 60_000;
export const SENSIBO_ALLOWED_VALUES_FETCH_DELAY = 300;

const endpointData = {
  url: 'https://home.sensibo.com',
  endpointId: SENSIBO_APP_NAME,
} satisfies IEndpoint;

type QorusResponse<T> = {
  data: T;
};

type TSensiboRequestOptions = {
  token: string;
  tokenType?: 'apiKey' | 'oauth';
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
};

type TPaginatedResponse<ItemType = unknown> = {
  isPartial: boolean;
  [key: string]: ItemType[] | any;
};

type TSensiboPaginatedOptions = TSensiboRequestOptions & {
  object?: string;
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TSensiboAllowedValuesOptions<ItemType = unknown> = TSensiboPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

export const sensiboApiClient = async <ResponseType = unknown>(
  options: TSensiboRequestOptions
): Promise<ResponseType> => {
  const { token, method = 'GET', tokenType = 'apiKey', body } = options;
  let { params } = options;
  const path = `/api/v2/${options.path}`;

  if (tokenType === 'apiKey') {
    params = { ...params, apiKey: token };
  }

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      ...(tokenType === 'oauth' && {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      path,
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
      throw new Error(`No data received from Sensibo API for ${path}`);
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Sensibo API for ${path}`, error);
    throw error;
  }
};

export const fetchSensiboPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TSensiboPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'data',
    method = 'GET',
    body,
    maxResults = 200,
    fetchDelay = SENSIBO_ALLOWED_VALUES_FETCH_DELAY,
    timeout = SENSIBO_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const limit = options.limit?.toString() || undefined;
  let page = 0;
  let hasMore = true;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Sensibo records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await sensiboApiClient<ResponseType>({
        token,
        path: options.path,
        method,
        params: {
          page: page.toString(),
          ...(limit && { limit }),
          ...options.params,
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      hasMore = response.isPartial === true;

      items.push(...objectData);

      if (hasMore) {
        page++;
        await delay(fetchDelay);
      }
    } while (hasMore);
  } catch (error) {
    Debugger.log(`Error fetching paginated Sensibo records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchSensiboAllowedValues = async <ItemType = unknown>(
  options: TSensiboAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchSensiboPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};
