import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get } from 'lodash';
import { MailchimpError } from '../error';

interface IFetchMailchimpDataOptions {
  token: string;
  datacenter: string;
  path: string;
  params?: Record<string, string>;
  dataPath?: string;
}

interface IMailchimpPaginationOptions {
  count?: number;
  offset?: number;
}

interface IPaginatedResponse<T> {
  [key: string]: T[] | number;
  total_items: number;
}

interface IGetMailchimpAllowedValuesOptions<ItemType, TAllowedValue>
  extends IFetchMailchimpDataOptions {
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<TAllowedValue>;
}

export const fetchMailchimpData = async <DataType = unknown>(
  options: IFetchMailchimpDataOptions
): Promise<DataType> => {
  const { token, datacenter, path, params } = options;

  try {
    const response = await QorusRequest.get<{ data: DataType }>(
      {
        path: `/3.0/${path}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        ...(params ? { params } : {}),
      },
      {
        url: `https://${datacenter}.api.mailchimp.com`,
        endpointId: 'mailchimp',
      }
    );

    if (!response?.data) {
      throw new Error('No data found in the response');
    }

    return response.data;
  } catch (error) {
    throw new MailchimpError(
      `Failed to fetch data for ${path}: ${error instanceof Error ? error.message : error}`
    );
  }
};

export const fetchMailchimpPaginatedData = async <DataType = unknown>(
  options: IFetchMailchimpDataOptions & IMailchimpPaginationOptions
): Promise<DataType[]> => {
  const { token, datacenter, path, params = {}, count = 1000, offset = 0 } = options;

  const allItems: DataType[] = [];
  let currentOffset = offset;
  let totalItems = 0;

  do {
    try {
      const data = await fetchMailchimpData<IPaginatedResponse<DataType>>({
        token,
        datacenter,
        path,
        params: {
          ...params,
          count: count.toString(),
          offset: currentOffset.toString(),
        },
      });

      const items = options.dataPath
        ? get(data, options.dataPath)
        : Object.values(data).find(Array.isArray);

      if (!items || !Array.isArray(items)) {
        throw new MailchimpError('Could not find items in the response');
      }

      allItems.push(...items);
      totalItems = data.total_items;
      currentOffset += count;
    } catch (error) {
      throw new MailchimpError(
        `Pagination failed: ${error instanceof Error ? error.message : error}`
      );
    }
  } while (currentOffset < totalItems);

  return allItems;
};

export const getMailchimpAllowedValues = async <ItemType, TAllowedValue>(
  options: IGetMailchimpAllowedValuesOptions<ItemType, TAllowedValue>
): Promise<IQoreAllowedValue<TAllowedValue>[]> => {
  const { mapItemToAllowedValue, ...fetchOptions } = options;

  try {
    const items = await fetchMailchimpPaginatedData<ItemType>(fetchOptions);
    const allowedValues: IQoreAllowedValue<TAllowedValue>[] = items.map(mapItemToAllowedValue);

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp allowed values: ${error instanceof Error ? error.message : error}`
    );
  }
};
