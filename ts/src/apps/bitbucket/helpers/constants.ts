import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { BITBUCKET_APP_NAME } from '../constants';

export const BITBUCKET_ALLOWED_VALUES_TIMEOUT = 60_000;
export const BITBUCKET_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchBitbucketAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object?: string;
  path: string;
  limit?: number;
  maxResults?: number;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

type TObjectsResponse<ItemType = unknown, ResponseKey extends string = string> = {
  [key in ResponseKey]: ItemType[];
} & {
  pagelen: number;
  size: number;
  page: number;
  next?: string;
  previous?: string;
};

export const fetchBitbucketAllowedValues = async <
  ItemType = unknown,
  ResponseKey extends string = 'values',
>(
  options: TFetchBitbucketAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchBitbucketRecords<ItemType, ResponseKey>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchBitbucketRecords = async <
  ItemType = unknown,
  ResponseKey extends string = 'values',
>(
  options: Omit<TFetchBitbucketAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { token, object = 'values' } = options;
  const items: ItemType[] = [];
  let next: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const pagelen = options.limit || 100;
  let path = `/2.0${options.path}?pagelen=${pagelen}`;

  try {
    do {
      if (Date.now() - startTime > BITBUCKET_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Bitbucket allowed values for ${path}`);
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
            path,
          },
          {
            url: `https://api.bitbucket.org`,
            endpointId: BITBUCKET_APP_NAME,
          }
        )) || {};

      const responseData = response.data;

      if (!responseData) {
        Debugger.log(`No data found for Bitbucket records for ${path}`);
        break;
      }

      const objectData = responseData[object as ResponseKey];

      if (!objectData?.length) {
        break;
      }

      next = responseData?.next || undefined;

      items.push(...objectData);

      if (next) {
        const url = new URL(next);
        const pathAfterBase = url.pathname + url.search;
        path = pathAfterBase;
        await delay(BITBUCKET_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (next);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching Bitbucket records for ${object}`, error);

    return items;
  }

  return items;
};
