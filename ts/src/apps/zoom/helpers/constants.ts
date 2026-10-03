// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { ZoomEndpointData } from '../constants';

export const ZOOM_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ZOOM_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchZoomAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  path: string;
  object: string;
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

export const fetchZoomAllowedValues = async <
  ItemType = unknown,
  ResponseKey extends string = string,
>(
  options: TFetchZoomAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchZoomRecords<ItemType, ResponseKey>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchZoomRecords = async <ItemType = unknown, ResponseKey extends string = string>(
  options: Omit<TFetchZoomAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { path, object, token } = options;

  const items: ItemType[] = [];
  let nextPageToken: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const limit = options.limit || 100;

  do {
    if (Date.now() - startTime >= ZOOM_ALLOWED_VALUES_TIMEOUT) {
      throw new Error(`Timeout fetching Zoom allowed values for ${object}`);
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
            ...(nextPageToken && { next_page_token: nextPageToken }),
            page_size: limit.toString(),
          },
          path,
        },
        ZoomEndpointData
      )) || {};
    if (Date.now() - startTime >= ZOOM_ALLOWED_VALUES_TIMEOUT) {
      throw new Error(`Timeout fetching Zoom allowed values for ${object}`);
    }

    const responseData = response.data;

    if (!responseData) {
      Debugger.log(`No data found for Zoom records for ${object}`);
      break;
    }

    const objectData = responseData[object as ResponseKey];

    if (!objectData?.length) {
      break;
    }

    nextPageToken = responseData?.next_page_token || undefined;

    items.push(...objectData);

    if (nextPageToken) {
      await delay(ZOOM_ALLOWED_VALUES_FETCH_DELAY);
    }
  } while (nextPageToken);

  return items;
};
