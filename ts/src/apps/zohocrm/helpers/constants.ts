import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { ZOHO_CRM_API_VERSION, ZOHO_CRM_APP_NAME } from '../constants';

export const ZOHO_CRM_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ZOHO_CRM_ALLOWED_VALUES_FETCH_DELAY = 300;
const ZOHO_CRM_PER_PAGE = 200;

type QorusResponse<T> = {
  data: T;
};

export type TZohoCrmRequestOptions = {
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
      info: {
        count: number;
        page: number;
        per_page: number;
        more_records: boolean;
        next_page_token?: string;
      };
    })
  | ItemType[]
  | any[];

type TZohoCrmPaginatedOptions = TZohoCrmRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TZohoCrmAllowedValuesOptions<ItemType = unknown> = TZohoCrmPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');

  if (!clean.startsWith('crm/')) {
    clean = `crm/${ZOHO_CRM_API_VERSION}/${clean}`;
  }

  return `/${clean}`;
};

export const zohoCrmApiClient = async <ResponseType = unknown>(
  options: TZohoCrmRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', url, body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url,
    endpointId: ZOHO_CRM_APP_NAME,
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
      throw new Error(`No data received from ZohoCRM API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling ZohoCRM API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchZohoCrmPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TZohoCrmPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'GET',
    url,
    body,
    path,
    maxResults = 500,
    fetchDelay = ZOHO_CRM_ALLOWED_VALUES_FETCH_DELAY,
    timeout = ZOHO_CRM_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let page_token: string | undefined;
  let moreRecords = true;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching ZohoCRM records for ${options.path}`);
        break;
      }

      const response: ResponseType = await zohoCrmApiClient<ResponseType>({
        token,
        path,
        url,
        method,
        params: {
          per_page: String(ZOHO_CRM_PER_PAGE),
          ...(page_token && { page_token }),
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
        moreRecords = response?.info?.more_records ?? false;
        if (items.length < maxResults && moreRecords) {
          await delay(fetchDelay);
          page_token = response?.info?.next_page_token;
        }
      }
    } while (items.length < maxResults && moreRecords);
  } catch (error) {
    Debugger.log(`Error fetching paginated zoho crm records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchZohoCrmAllowedValues = async <ItemType = unknown>(
  options: TZohoCrmAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchZohoCrmPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
