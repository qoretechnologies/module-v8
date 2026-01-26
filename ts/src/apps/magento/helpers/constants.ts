import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';

export const MAGENTO_ALLOWED_VALUES_FETCH_DELAY = 300;
export const MAGENTO_ALLOWED_VALUES_TIMEOUT = 10_000;

export type TFetchMagentoDataOptions = {
  url: string;
  token: string;
  limit?: number;
  offset?: number;
  path: string;
  params?: Record<string, string>;
};

export type TfetchMagentoAllowedValuesOptions<ItemType = unknown, AllowedValueType = string> = {
  token: string;
  url: string;
  path: string;
  params?: Record<string, string>;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<AllowedValueType>;
};

export type TfetchMagentoObjectFieldsAllowedValuesOptions = {
  token: string;
  url: string;
  path: string;
  params?: Record<string, string>;
};

export type TMagentoData<ItemType = unknown> = {
  items: ItemType[];
  total_count: number;
  search_criteria: {
    current_page: number;
    page_size: number;
  };
};

/**
 * fetch Magento data
 */
export const fetchMagentoData = async <ItemType = unknown>(
  options: TFetchMagentoDataOptions
): Promise<{ data: ItemType[]; hasMore: boolean }> => {
  try {
    const { token, limit = 100, offset = 0, path, url } = options;
    const page = Math.floor(offset / limit) + 1;

    const response = await QorusRequest.get<{ data: TMagentoData<ItemType> }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        path: `/rest${path}`,
        params: {
          'searchCriteria[pageSize]': limit.toString(),
          'searchCriteria[currentPage]': page.toString(),
          ...(options.params || {}),
        },
      },
      { endpointId: 'Magento', url }
    );

    const responseData = response?.data;

    if (!responseData?.items) {
      throw new Error('Failed to fetch data from Magento: No data returned');
    }

    const totalItems = responseData.total_count;
    const currentItems = offset + responseData.items.length;

    return {
      data: responseData.items,
      hasMore: currentItems < totalItems,
    };
  } catch (error) {
    throw new Error(`Failed to fetch data from Magento: ${error}`);
  }
};

/**
 * Fetch Magento allowed values
 */
export const fetchMagentoAllowedValues = async <ItemType = unknown, AllowedValueType = string>(
  options: TfetchMagentoAllowedValuesOptions<ItemType, AllowedValueType>
): Promise<IQoreAllowedValue<AllowedValueType>[]> => {
  const allowedValues: IQoreAllowedValue<AllowedValueType>[] = [];
  const startTime = Date.now();
  let offset = 0;
  const limit = 500;

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > MAGENTO_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Magento allowed values`);
        break;
      }

      const { data, hasMore: more } = await fetchMagentoData({
        path: options.path,
        token: options.token,
        params: options.params,
        url: options.url,
        limit,
        offset,
      });

      allowedValues.push(...data.map(options.mapItemToAllowedValue));

      hasMore = more;
      offset += data.length;

      if (hasMore) {
        await delay(MAGENTO_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log(`Failed to fetch Magento allowed values: ${error}`);
  } finally {
    return allowedValues;
  }
};

export const fetchMagentoObjectFieldsAllowedValues = async (
  options: TfetchMagentoObjectFieldsAllowedValuesOptions
): Promise<IQoreAllowedValue<string>[]> => {
  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    const { data } = await fetchMagentoData<Record<string, any>>({
      path: options.path,
      token: options.token,
      params: options.params,
      url: options.url,
      limit: 1,
    });

    if (!data.length) {
      throw new Error('No data returned from Magento');
    }

    const item = data[0];

    Object.entries(item).forEach(([key, value]) => {
      if (typeof value === 'object') return;

      allowedValues.push({
        value: key,
        display_name: key,
        short_desc: `Example value: ${value}`,
      });
    });

    return allowedValues;
  } catch (error) {
    Debugger.log(`Failed to fetch Magento object fields allowed values: ${error}`);

    return [];
  }
};
