import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { Messenger360Error } from '../constants';

export interface IFetch360MessengerDataOptions {
  token: string;
  path: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
  method?: 'POST' | 'GET';
  dataPath?: string;
}

export interface IGet360MessengerAllowedValuesOptions<TEntityData>
  extends IFetch360MessengerDataOptions {
  mapFn: (item: TEntityData) => IQoreAllowedValue<string>;
}

export const fetch360MessengerData = async <TEntityData>(
  options: IFetch360MessengerDataOptions
): Promise<TEntityData> => {
  const { token, path, params = {}, dataPath } = options;

  try {
    const method = options.method || 'GET';

    let response: { data: any } | undefined;

    if (method === 'POST') {
      response = await QorusRequest.post<{ data: any }>(
        {
          path,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          params: {
            ...params,
          },
          ...(options.body && { data: options.body }),
        },
        {
          url: 'https://api.360messenger.com/v2',
          endpointId: '360Messenger',
        }
      );
    } else if (method === 'GET') {
      response = await QorusRequest.get<{ data: any }>(
        {
          path,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          params: {
            ...params,
          },
        },
        {
          url: 'https://api.360messenger.com/v2',
          endpointId: '360Messenger',
        }
      );
    }

    if (!response?.data) {
      throw new Error('No data found in response');
    }

    const responseData = dataPath ? get(response.data, dataPath) : response.data;

    if (!responseData) {
      throw new Error(`Invalid data format in response at path ${dataPath || 'result'}`);
    }

    return responseData as TEntityData;
  } catch (error) {
    throw new Messenger360Error(
      `Failed to fetch 360Messenger data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const get360MessengerAllowedValues = async <TEntityData>(
  options: IGet360MessengerAllowedValuesOptions<TEntityData>
): Promise<IQoreAllowedValue<string>[]> => {
  const { mapFn, ...fetchOptions } = options;

  try {
    const items = await fetch360MessengerData<TEntityData[]>(fetchOptions);

    return items.map(mapFn);
  } catch (error) {
    throw new Messenger360Error(
      `Failed to get 360Messenger allowed values: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const format360MessengerDelay = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${month}-${day}-${year} ${hours}:${minutes}`;
};
