import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { get } from 'lodash';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { COPPER_CRM_APP_NAME } from '../constants';

export const COPPER_CRM_ALLOWED_VALUES_TIMEOUT = 60_000;
export const COPPER_CRM_ALLOWED_VALUES_FETCH_DELAY = 300;
const COPPER_CRM_PER_PAGE = 200;

type QorusResponse<T> = {
  data: T;
  totalResults?: number;
};

export type TCopperCrmRequestOptions = {
  token: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> =
  | ({
      [key: string]: ItemType[] | any;
    } & {
      totalResults?: number;
    })
  | ItemType[]
  | any[];

type TCopperCrmPaginatedOptions = TCopperCrmRequestOptions & {
  limit?: number;
  maxResults?: number;
  fetchDelay?: number;
  timeout?: number;
};

type TCopperCrmAllowedValuesOptions<ItemType = unknown> = TCopperCrmPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  let clean = path.trim().replace(/^\/+/, '');

  if (!clean.startsWith('developer_api/')) {
    clean = `developer_api/v1/${clean}`;
  }

  return `/${clean}`;
};

export const copperCrmApiClient = async <ResponseType = unknown>(
  options: TCopperCrmRequestOptions
): Promise<ResponseType> => {
  const { token, path, object, method = 'GET', body, params } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url: 'https://api.copper.com',
    endpointId: COPPER_CRM_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const oauthHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...oauthHeaders,
        ...(options.headers && { ...options.headers }),
      },
      path: formattedPath,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET': {
        const responseData = await axios.get<QorusResponse<ResponseType>>(
          `${endpointData.url}${formattedPath}`,
          {
            headers: requestConfig.headers,
            ...(requestConfig.params && { params: requestConfig.params }),
          }
        );

        const maxResultsHeader = responseData.headers['x-pw-total'];

        response = {
          data: responseData.data as ResponseType,
          totalResults: maxResultsHeader ? Number(maxResultsHeader) : undefined,
        };
        break;
      }
      case 'POST': {
        const responseData = await axios.post<QorusResponse<ResponseType>>(
          `${endpointData.url}${formattedPath}`,
          body,
          {
            headers: requestConfig.headers,
            ...(requestConfig.params && { params: requestConfig.params }),
          }
        );

        const maxResultsHeader = responseData.headers['x-pw-total'];

        response = {
          data: responseData.data as ResponseType,
          totalResults: maxResultsHeader ? Number(maxResultsHeader) : undefined,
        };
        break;
      }
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
      throw new Error(`No data received from CopperCRM API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    if ('totalResults' in response && response.totalResults !== undefined) {
      return {
        results: response.data,
        totalResults: response.totalResults,
      } as ResponseType;
    }

    return response.data;
  } catch (error) {
    let errorText = 'An unknown error occurred';

    if (axios.isAxiosError(error) && error.response) {
      errorText = `Error response from CopperCRM API for ${endpointData.url}${formattedPath}: ${error.response.statusText} ${JSON.stringify(error.response.data)}`;

      Debugger.log(errorText);
    } else {
      errorText = `Error calling CopperCRM API for ${endpointData.url}${formattedPath}: ${error.message || error}`;

      Debugger.log(errorText);
    }

    throw new Error(errorText);
  }
};

export const fetchCopperCrmPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TCopperCrmPaginatedOptions
): Promise<ItemType[]> => {
  const {
    token,
    object = 'results',
    method = 'POST',
    path,
    maxResults = 500,
    limit = COPPER_CRM_PER_PAGE,
    fetchDelay = COPPER_CRM_ALLOWED_VALUES_FETCH_DELAY,
    timeout = COPPER_CRM_ALLOWED_VALUES_TIMEOUT,
  } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();

  let pageNumber = 1;
  let totalResults: number | undefined = undefined;

  try {
    do {
      if (Date.now() - startTime > timeout) {
        Debugger.log(`Timeout fetching CopperCRM records for ${options.path}`);
        break;
      }

      const params = {
        ...options.params,
        ...(method === 'GET' && {
          page_size: limit.toString(),
          page_number: pageNumber.toString(),
        }),
      };

      const body = {
        ...options.body,
        ...(method === 'POST' && {
          page_size: limit,
          page_number: pageNumber,
        }),
      };

      const response: ResponseType = await copperCrmApiClient<ResponseType>({
        token,
        path,
        method,
        params,
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
        totalResults = response.totalResults;

        if (items.length < maxResults && items.length < (totalResults || 0)) {
          await delay(fetchDelay);
          pageNumber += 1;
        }
      }
    } while (items.length < maxResults && items.length < (totalResults || 0));
  } catch (error) {
    Debugger.log(`Error fetching paginated CopperCRM records for ${options.path}`, error);

    return items;
  }

  return items;
};

export const fetchCopperCrmAllowedValues = async <ItemType = unknown>(
  options: TCopperCrmAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchCopperCrmPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(
    options
  );

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};
