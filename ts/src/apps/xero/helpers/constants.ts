import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { XeroError } from '../constants';

const MAX_ITEMS_PER_PAGE = 100;
const MAX_PAGES = 10;

export const getTokenRequired = (
  context?: TQoreAppActionFunctionContext<TCustomConnOptions>
): string => {
  const token = context?.conn_opts?.token;
  if (!token) throw new XeroError('Token is required for Xero API operations');

  return token;
};

export const getTenantIdRequired = (
  context?: TQoreAppActionFunctionContext<TCustomConnOptions>
): string => {
  const tenantId = context?.opts?.['xero-tenant-id'] || context?.opts?.['Xero-Tenant-Id'];
  if (!tenantId) throw new XeroError('Tenant ID is required for Xero API operations');

  return tenantId;
};

export const fetchXeroData = async <T>(options: {
  token: string;
  tenantId: string;
  api?: 'api' | 'projects';
  path: string;
  params?: Record<string, string>;
}): Promise<T> => {
  const { token, tenantId, path, params = {}, api = 'api' } = options;

  try {
    let allData: any = null;
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const queryParams = {
        ...params,
        page: currentPage.toString(),
        limit: MAX_ITEMS_PER_PAGE.toString(),
      };

      const response = await QorusRequest.get<{ data: any }>(
        {
          path: `/${api}.xro/2.0/${path}`,
          headers: {
            Authorization: `Bearer ${token}`,
            'Xero-Tenant-Id': tenantId,
            Accept: 'application/json',
          },
          params: queryParams,
        },
        {
          url: 'https://api.xero.com',
          endpointId: 'xero',
        }
      );

      if (!response?.data) {
        throw new Error('No data found in the response');
      }

      const data = response.data;

      if (!allData) {
        allData = data;
      } else {
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key]) && Array.isArray(allData[key])) {
            allData[key] = [...allData[key], ...data[key]];
          }
        });
      }

      const items = Object.values(data).find((val) => Array.isArray(val)) as any[];
      hasMorePages = items?.length === MAX_ITEMS_PER_PAGE;

      currentPage++;

      if (currentPage > MAX_PAGES) {
        Debugger.log('Reached maximum pagination limit for Xero API request');
        break;
      }
    }

    return allData as T;
  } catch (error) {
    throw new XeroError(`Failed to fetch data from Xero API for ${path}: ${error}`);
  }
};

export const getXeroAllowedValues = async <T, V>(options: {
  token: string;
  tenantId: string;
  path: string;
  api?: 'api' | 'projects';
  dataPath?: string;
  params?: Record<string, string>;
  mapItemToAllowedValue: (item: T) => IQoreAllowedValue<V>;
}): Promise<IQoreAllowedValue<V>[]> => {
  const { mapItemToAllowedValue, dataPath, ...fetchOptions } = options;

  try {
    const data = await fetchXeroData<any>(fetchOptions);

    let items: T[] = [];
    if (dataPath) {
      const parts = dataPath.split('.');
      let current = data;
      for (const part of parts) {
        current = current?.[part];
        if (!current) {
          throw new XeroError(`Data path ${dataPath} not found in response`);
        }
      }
      items = current;
    } else {
      const firstArray = Object.values(data).find((value) => Array.isArray(value));
      items = (firstArray as T[]) || [];
    }

    if (!Array.isArray(items)) {
      throw new XeroError('Expected array of items in response');
    }

    return items.map(mapItemToAllowedValue);
  } catch (error) {
    Debugger.log(`Error getting Xero allowed values:`, error);
    throw new XeroError(`Failed to get Xero allowed values: ${error}`);
  }
};
