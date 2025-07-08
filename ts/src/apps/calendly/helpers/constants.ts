import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CALENDLY_APP_NAME } from '../constants';

export const CALENDLY_ALLOWED_VALUES_TIMEOUT = 60_000;
export const CALENDLY_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchCalendlyAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object?: string;
  path: string;
  limit?: number;
  maxResults?: number;
  params?: Record<string, string>;
  method?: 'GET' | 'POST';
  body?: Record<string, any>;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

type TObjectsResponse<ItemType = unknown, ResponseKey extends string = string> = {
  [key in ResponseKey]: ItemType[];
} & {
  pagination: {
    count: number;
    next_page?: string;
    previous_page?: string;
    next_page_token?: string;
    previous_page_token?: string;
  };
};

export const fetchCalendlyAllowedValues = async <
  ItemType = unknown,
  ResponseKey extends string = 'collection',
>(
  options: TFetchCalendlyAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchCalendlyRecords<ItemType, ResponseKey>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchCalendlyRecords = async <
  ItemType = unknown,
  ResponseKey extends string = 'collection',
>(
  options: Omit<TFetchCalendlyAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { token, object = 'collection', method = 'GET', body } = options;
  const items: ItemType[] = [];
  let next: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const count = options.limit?.toString() || '100';
  let path = `/${options.path}`;

  try {
    do {
      if (Date.now() - startTime > CALENDLY_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Calendly allowed values for ${path}`);
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
                count,
                ...options.params,
              },
              path,
            },
            {
              url: `https://api.calendly.com`,
              endpointId: CALENDLY_APP_NAME,
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
              ...(body && { data: body }),
            },
            {
              url: `https://api.calendly.com`,
              endpointId: CALENDLY_APP_NAME,
            }
          )) || {};
      }

      const responseData = response.data;

      if (!responseData) {
        Debugger.log(`No data found for Calendly records for ${path}`);
        break;
      }

      const objectData = responseData[object as ResponseKey];

      if (!objectData?.length) {
        break;
      }

      next = responseData?.pagination?.next_page_token || undefined;

      items.push(...objectData);

      if (next) {
        const url = new URL(next);
        const pathAfterBase = url.pathname + url.search;
        path = pathAfterBase;
        await delay(CALENDLY_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (next);
  } catch (error) {
    Debugger.log(`Error fetching Calendly records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchCalendlyData = async <ItemType = unknown, ResponseKey extends string = ''>(
  options: Omit<TFetchCalendlyAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType> => {
  const { token, object = '', params, method = 'GET', body } = options;
  const path = `/${options.path}`;

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
            url: `https://api.calendly.com`,
            endpointId: CALENDLY_APP_NAME,
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
            ...(params && { params }),
            ...(body && { data: body }),
            path,
          },
          {
            url: `https://api.calendly.com`,
            endpointId: CALENDLY_APP_NAME,
          }
        )) || {};
    }

    const responseData = response?.data;

    if (!responseData) {
      throw new Error(`No data found for Calendly records for ${path}`);
    }

    return object
      ? (get(responseData, object as ResponseKey) as ItemType)
      : (responseData as ItemType);
  } catch (error) {
    throw new Error(`Error fetching Calendly records for ${path}: ${error}`);
  }
};
