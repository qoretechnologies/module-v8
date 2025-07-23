import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { ACTIVE_CAMPAIGN_APP_NAME } from '../constants';

export const ACTIVE_CAMPAIGN_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ACTIVE_CAMPAIGN_ALLOWED_VALUES_FETCH_DELAY = 300;

type QorusResponse<T> = {
  data: T;
};

type TActiveCampaignRequestOptions = {
  token: string;
  url: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
};

type TPaginatedResponse<ItemType = unknown> = {
  meta: {
    total: number;
  };
  [key: string]: ItemType[] | any;
};

type TActiveCampaignPaginatedOptions = TActiveCampaignRequestOptions & {
  object?: string;
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TActiveCampaignAllowedValuesOptions<ItemType = unknown> = TActiveCampaignPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

export const activeCampaignApiClient = async <ResponseType = unknown>(
  options: TActiveCampaignRequestOptions
): Promise<ResponseType> => {
  const { token, url, method = 'GET', body, params } = options;
  const path = `/api/3/${options.path}`;

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const requestConfig = {
      headers: {
        'Api-Token': token,
      },
      path,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    const endpointData = {
      url,
      endpointId: ACTIVE_CAMPAIGN_APP_NAME,
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
      throw new Error(`No data received from Active Campaign API for ${path}`);
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Active Campaign API for ${path}`, error);
    throw error;
  }
};

export const fetchActiveCampaignPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TActiveCampaignPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    url,
    object = 'data',
    method = 'GET',
    body,
    maxResults = 500,
    fetchDelay = ACTIVE_CAMPAIGN_ALLOWED_VALUES_FETCH_DELAY,
    timeout = ACTIVE_CAMPAIGN_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const limit = options.limit || 100;
  let total = 0;
  let offset = 0;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching Active Campaign records for ${options.path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response = await activeCampaignApiClient<ResponseType>({
        token,
        url,
        path: options.path,
        method,
        params: {
          offset: offset.toString(),
          limit: limit.toString(),
          ...options.params,
        },
        body,
      });

      const objectData = get(response, object) as ItemType[] | undefined;

      if (!objectData?.length) {
        break;
      }

      total = response.meta?.total || 0;

      items.push(...objectData);

      if (items.length < total) {
        offset += limit;
        await delay(fetchDelay);
      }
    } while (items.length < total && items.length < maxResults);
  } catch (error) {
    Debugger.log(`Error fetching paginated Active Campaign records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchActiveCampaignAllowedValues = async <ItemType = unknown>(
  options: TActiveCampaignAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchActiveCampaignPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );

  return items.map(options.mapItemToAllowedValue);
};
