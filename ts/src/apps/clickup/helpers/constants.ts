import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CLICKUP_APP_NAME } from '../constants';

export const CLICKUP_ALLOWED_VALUES_TIMEOUT = 60_000;
export const CLICKUP_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchClickUpAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object?: string;
  path: string;
  limit?: number;
  maxResults?: number;
  params?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT';
  version?: 'v2' | 'v3';
  body?: Record<string, any>;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

type TObjectsResponse<ItemType = unknown, ResponseKey extends string = string> = {
  [key in ResponseKey]: ItemType[];
} & {
  last_page: boolean;
};

export const fetchClickUpAllowedValues = async <
  ItemType = unknown,
  ResponseKey extends string = 'data',
>(
  options: TFetchClickUpAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchClickUpRecords<ItemType, ResponseKey>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchClickUpRecords = async <ItemType = unknown, ResponseKey extends string = 'data'>(
  options: Omit<TFetchClickUpAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { token, object = 'data', method = 'GET', body, version = 'v2' } = options;
  const items: ItemType[] = [];
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const limit = options.limit?.toString() || undefined;
  const path = `/api/${version}/${options.path}`;
  let page = 0;
  let hasMore = true;

  try {
    do {
      if (Date.now() - startTime > CLICKUP_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching ClickUp allowed values for ${path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      let response: { data?: TObjectsResponse<ItemType, ResponseKey> } = {};

      if (method === 'GET') {
        response =
          (await QorusRequest.get<{
            data: TObjectsResponse<ItemType, ResponseKey>;
          }>(
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                page: page.toString(),
                ...(limit && { limit }),
                ...options.params,
              },
              path,
            },
            {
              url: 'https://api.clickup.com',
              endpointId: CLICKUP_APP_NAME,
            }
          )) || {};
      } else {
        response =
          (await QorusRequest.post<{
            data: TObjectsResponse<ItemType, ResponseKey>;
          }>(
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              path,
              params: {
                page: page.toString(),
                ...(limit && { limit }),
                ...options.params,
              },
              ...(body && { data: body }),
            },
            {
              url: 'https://api.clickup.com',
              endpointId: CLICKUP_APP_NAME,
            }
          )) || {};
      }

      const responseData = response.data;

      if (!responseData) {
        Debugger.log(`No data found for ClickUp records for ${path}`);
        break;
      }

      const objectData = get(responseData, object as ResponseKey);

      if (!objectData?.length) {
        break;
      }

      hasMore = responseData.last_page === true;

      items.push(...objectData);

      if (hasMore) {
        page++;
        await delay(CLICKUP_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (hasMore);
  } catch (error) {
    Debugger.log(`Error fetching ClickUp records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchClickUpData = async <ItemType = unknown, ResponseKey extends string = ''>(
  options: Omit<TFetchClickUpAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType> => {
  const { token, object = '', params, method = 'GET', body, version = 'v2' } = options;
  const path = `/api/${version}/${options.path}`;

  try {
    let response: { data?: TObjectsResponse<ItemType, ResponseKey> } = {};

    if (method === 'GET') {
      response =
        (await QorusRequest.get<{
          data: TObjectsResponse<ItemType, ResponseKey>;
        }>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            ...(params && { params }),
            path,
          },
          {
            url: 'https://api.clickup.com',
            endpointId: CLICKUP_APP_NAME,
          }
        )) || {};
    } else if (method === 'POST') {
      response =
        (await QorusRequest.post<{
          data: TObjectsResponse<ItemType, ResponseKey>;
        }>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            ...(params && { params }),
            ...(body && { data: body }),
            path,
          },
          {
            url: 'https://api.clickup.com',
            endpointId: CLICKUP_APP_NAME,
          }
        )) || {};
    } else if (method === 'PUT') {
      response =
        (await QorusRequest.put<{
          data: TObjectsResponse<ItemType, ResponseKey>;
        }>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            ...(params && { params }),
            ...(body && { data: body }),
            path,
          },
          {
            url: 'https://api.clickup.com',
            endpointId: CLICKUP_APP_NAME,
          }
        )) || {};
    }

    const responseData = response?.data;

    if (!responseData) {
      throw new Error(`No data found for ClickUp records for ${path}`);
    }

    return object
      ? (get(responseData, object as ResponseKey) as ItemType)
      : (responseData as ItemType);
  } catch (error) {
    throw new Error(`Error fetching ClickUp records for ${path}: ${error}`);
  }
};
