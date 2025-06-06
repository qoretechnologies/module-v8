import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreResponseDataConverterFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { CONFLUENCE_APP_NAME } from '../constants';

export const CONFLUENCE_ALLOWED_VALUES_TIMEOUT = 60_000;
export const CONFLUENCE_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchConfluenceAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  cloudId: string;
  object?: string;
  path: string;
  limit?: number;
  maxResults?: number;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

type TObjectsResponse<ItemType = unknown, ResponseKey extends string = string> = {
  [key in ResponseKey]: ItemType[];
} & {
  page_size: number;
  total_records: number;
  next_page_token?: string;
};

export const fetchConfluenceAllowedValues = async <
  ItemType = unknown,
  ResponseKey extends string = 'results',
>(
  options: TFetchConfluenceAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchConfluenceRecords<ItemType, ResponseKey>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchConfluenceRecords = async <
  ItemType = unknown,
  ResponseKey extends string = 'results',
>(
  options: Omit<TFetchConfluenceAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { path, cloudId, object = 'results', token } = options;

  const items: ItemType[] = [];
  let cursor: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const limit = options.limit || 100;

  try {
    do {
      if (Date.now() - startTime > CONFLUENCE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Confluence allowed values for ${path}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const response: { data?: TObjectsResponse<ItemType, ResponseKey> } =
        (await QorusRequest.get<{
          data: TObjectsResponse<ItemType, ResponseKey>;
        }>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              ...(cursor ? { cursor: cursor as string } : {}),
              limit: limit.toString(),
            },
            path,
          },
          {
            url: `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/api/v2`,
            endpointId: CONFLUENCE_APP_NAME,
          }
        )) || {};

      const responseData = response.data;

      if (!responseData) {
        Debugger.log(`No data found for Confluence records for ${path}`);
        break;
      }

      const objectData = responseData[object as ResponseKey];

      if (!objectData?.length) {
        break;
      }

      cursor = responseData?.next_page_token || undefined;

      items.push(...objectData);

      if (cursor) {
        await delay(CONFLUENCE_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (cursor);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching Confluence records for ${object}`, error);

    return items;
  }

  return items;
};

export const confluencePaginationResponseConverter: TQoreResponseDataConverterFunction = (req) => {
  const _links = req?.body?._links as { next?: string };
  let cursor: string | null = null;

  if (_links?.next) {
    const fullUrl = new URL(`http://example.com${_links.next}`);
    cursor = fullUrl.searchParams.get('cursor');
  }

  return {
    ...req.body,
    cursor,
  };
};
