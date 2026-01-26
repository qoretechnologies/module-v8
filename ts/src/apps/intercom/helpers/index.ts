import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IntercomError } from '../error';

export interface IFetchIntercomDataOptions {
  token: string;
  path: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
  method?: 'POST' | 'GET';
  dataPath?: string;
}

export interface IGetIntercomAllowedValuesOptions<TEntityData> extends IFetchIntercomDataOptions {
  mapFn: (item: TEntityData) => IQoreAllowedValue<string>;
}

export const fetchIntercomData = async <TEntityData>(
  options: IFetchIntercomDataOptions
): Promise<TEntityData[]> => {
  const { token, path, params = {}, dataPath } = options;

  try {
    let page = 1;
    let totalPages = 1;
    const allItems: TEntityData[] = [];
    const method = options.method || 'GET';

    do {
      let response: any;

      if (method === 'POST') {
        response = await QorusRequest.post<{ data: any }>(
          {
            path,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Intercom-Version': '2.9',
            },
            params: {
              ...params,
              page: page.toString(),
              per_page: '50',
            },
            ...(options.body && { data: options.body }),
          },
          {
            url: 'https://api.intercom.io',
            endpointId: 'Intercom',
          }
        );
      } else if (method === 'GET') {
        response = await QorusRequest.get<{ data: any }>(
          {
            path,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
              'Intercom-Version': '2.9',
            },
            params: {
              ...params,
              page: page.toString(),
              per_page: '50',
            },
          },
          {
            url: 'https://api.intercom.io',
            endpointId: 'Intercom',
          }
        );
      }

      if (!response?.data) {
        throw new Error('No data found in response');
      }

      const responseData = dataPath ? response.data[dataPath] : response.data.data;

      if (!responseData || !Array.isArray(responseData)) {
        throw new Error(`Invalid data format in response at path ${dataPath || 'data'}`);
      }

      allItems.push(...responseData);

      const pages = response.data.pages;
      totalPages = pages?.total_pages || 1;
      page++;
    } while (page <= totalPages);

    return allItems;
  } catch (error) {
    throw new IntercomError(
      `Failed to fetch Intercom data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getIntercomAllowedValues = async <TEntityData>(
  options: IGetIntercomAllowedValuesOptions<TEntityData>
): Promise<IQoreAllowedValue<string>[]> => {
  const { mapFn, ...fetchOptions } = options;

  try {
    const items = await fetchIntercomData<TEntityData>(fetchOptions);

    return items.map(mapFn);
  } catch (error) {
    throw new IntercomError(
      `Failed to get Intercom allowed values: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
