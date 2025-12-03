import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { Debugger } from '../../../utils/Debugger';
import { CRAFT_APP_NAME } from '../constants';
import axios from 'axios';

type QorusResponse<T> = {
  data: T;
};

export type TCraftRequestOptions = {
  url: string;
  token?: string;
  object?: string;
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
};

type TPaginatedResponse<ItemType = unknown> =
  | {
      [key: string]: ItemType[] | any;
    }
  | ItemType[]
  | any[];

type TCraftPaginatedOptions = TCraftRequestOptions;
type TCraftAllowedValuesOptions<ItemType = unknown> = TCraftPaginatedOptions & {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
  filterItems?: (item: ItemType) => boolean;
};

const formatPath = (path: string): string => {
  return `/${path.trim().replace(/^\/+/, '')}`;
};

export const craftApiClient = async <ResponseType = unknown>(
  options: TCraftRequestOptions
): Promise<ResponseType> => {
  const { url, path, object, method = 'GET', body, params, token } = options;

  const formattedPath = formatPath(path);

  const endpointData = {
    url,
    endpointId: CRAFT_APP_NAME,
  };

  try {
    let response: QorusResponse<ResponseType> | undefined;

    const additionalHeaders = options.headers || {};
    const headers = token
      ? { Authorization: `Bearer ${token}`, ...additionalHeaders }
      : additionalHeaders;

    const requestConfig = {
      path: formattedPath,
      ...(headers && { headers }),
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET':
        if (headers?.Accept === 'text/markdown') {
          const responseData = await axios.get<string>(`${endpointData.url}${formattedPath}`, {
            headers,
            params,
          });

          response = {
            data: responseData.data as ResponseType,
          };
        } else {
          response = await QorusRequest.get<QorusResponse<ResponseType>>(
            requestConfig,
            endpointData
          );
        }
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
      throw new Error(`No data received from Craft API for ${path}`);
    }

    if (object) {
      return get(response.data, object) as ResponseType;
    }

    return response.data;
  } catch (error) {
    Debugger.log(`Error calling Craft API for ${endpointData.url}${formattedPath}`, error);
    throw error;
  }
};

export const fetchCraftPaginatedRecords = async <
  ResponseType extends TPaginatedResponse<ItemType> = TPaginatedResponse,
  ItemType = unknown,
>(
  options: TCraftPaginatedOptions
): Promise<ItemType[]> => {
  const { object = 'items', method = 'GET', url, body, path, params, token } = options;

  const items: ItemType[] = [];

  try {
    const response: ResponseType = await craftApiClient<ResponseType>({
      path,
      url,
      token,
      method,
      params,
      body,
    });

    if (Array.isArray(response)) {
      if (!response.length) return items;
      items.push(...response);
    } else {
      const objectData = get(response, object) as ItemType[] | undefined;
      if (!objectData?.length) return items;
      items.push(...objectData);
    }
  } catch (error) {
    Debugger.log(`Error fetching paginated zoho crm records for ${object}`, error);

    return items;
  }

  return items;
};

export const fetchCraftAllowedValues = async <ItemType = unknown>(
  options: TCraftAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchCraftPaginatedRecords<TPaginatedResponse<ItemType>, ItemType>(options);

  const filteredItems = options.filterItems ? items.filter(options.filterItems) : items;

  return filteredItems.map(options.mapItemToAllowedValue);
};

export const extractCraftBlockContent = (
  block: any,
  options?: {
    includeAltText?: boolean;
    includeFileNames?: boolean;
    separator?: string;
  }
): string => {
  const { includeAltText = false, includeFileNames = false, separator = '\n' } = options || {};

  const contentParts: string[] = [];

  switch (block.type) {
    case 'text':
      if (block.markdown) {
        contentParts.push(block.markdown);
      }
      break;

    case 'page':
    case 'collectionItem':
      if (block.title?.value) {
        contentParts.push(block.title.value);
      }
      if (block.content && Array.isArray(block.content)) {
        for (const childBlock of block.content) {
          const childContent = extractCraftBlockContent(childBlock, options);
          if (childContent) {
            contentParts.push(childContent);
          }
        }
      }
      break;

    case 'table':
    case 'collection':
      if (block.markdown) {
        contentParts.push(block.markdown);
      }
      break;

    case 'code':
      if (block.rawCode) {
        contentParts.push(block.rawCode);
      }
      break;

    case 'richLink':
      if (block.title) {
        contentParts.push(block.title);
      }
      if (block.description) {
        contentParts.push(block.description);
      }
      break;

    case 'image':
    case 'video':
      if (includeAltText && block.altText) {
        contentParts.push(block.altText);
      }
      break;

    case 'file':
      if (includeFileNames && block.fileName) {
        contentParts.push(block.fileName);
      }
      break;

    case 'drawing':
    case 'whiteboard':
    case 'line':
      break;

    default:
      console.warn(`Unknown Craft block type: ${block.blockType}`);
      break;
  }

  return contentParts.filter((part) => part.trim().length > 0).join(separator);
};
