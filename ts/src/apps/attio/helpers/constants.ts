import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { AttioEndpointData, AttioError } from '../constants';

const MAX_ITEMS_PER_PAGE = 50;
const MAX_PAGES = 10;

export const getAttioTokenRequired = (
  context?: TQoreAppActionFunctionContext<TCustomConnOptions>
): string => {
  const token = context?.conn_opts?.token;
  if (!token) throw new AttioError('Token is required for Attio API operations');

  return token;
};

export interface IFetchAttioDataOptions {
  token: string;
  path: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
  method?: 'GET' | 'POST';
}

export interface IFetchAttioAllowedValuesOptions<TItemType, TAllowedValueType>
  extends IFetchAttioDataOptions {
  mapItemToAllowedValue: (item: TItemType) => IQoreAllowedValue<TAllowedValueType>;
}

export type QorusRequestResponse<TItemType> = { data: { data: TItemType[] } };

export const fetchAttioData = async <TItemType, TResponseType = TItemType[]>(
  options: IFetchAttioDataOptions
): Promise<TResponseType> => {
  const { token, path, method = 'GET' } = options;
  let { body = {}, params = {} } = options;

  try {
    let allData: any = null;
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      if (method === 'POST') {
        body = {
          ...body,
          offset: (currentPage - 1) * MAX_ITEMS_PER_PAGE,
          limit: MAX_ITEMS_PER_PAGE,
        };
      } else {
        params = {
          ...params,
          offset: ((currentPage - 1) * MAX_ITEMS_PER_PAGE).toString(),
          limit: MAX_ITEMS_PER_PAGE.toString(),
        };
      }

      let response: { data: any } | undefined;

      const commonRequestOptions = {
        path: `/v2/${path}`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params,
      };

      if (method === 'POST') {
        response = await QorusRequest.post<QorusRequestResponse<TItemType>>(
          {
            ...commonRequestOptions,
            data: body,
          },
          AttioEndpointData
        );
      } else {
        response = await QorusRequest.get<QorusRequestResponse<TItemType>>(
          commonRequestOptions,
          AttioEndpointData
        );
      }

      if (!response?.data) {
        throw new Error('No data found in the response');
      }

      const data = response.data;

      allData = allData ? [...allData, data.data] : data.data;

      const items = data.data;
      hasMorePages = items?.length === MAX_ITEMS_PER_PAGE;

      currentPage++;

      if (currentPage > MAX_PAGES) {
        Debugger.log('Reached maximum pagination limit for Attio API request');
        break;
      }
    }

    return allData as TResponseType;
  } catch (error) {
    throw new AttioError(`Failed to fetch data from Attio API for ${path}: ${error}`);
  }
};

export const getAttioAllowedValues = async <TItemType, TAllowedValueType>(
  options: IFetchAttioAllowedValuesOptions<TItemType, TAllowedValueType>
): Promise<IQoreAllowedValue<TAllowedValueType>[]> => {
  const { mapItemToAllowedValue, ...fetchOptions } = options;

  try {
    const items = await fetchAttioData<TItemType>(fetchOptions);
    if (!Array.isArray(items)) {
      throw new AttioError('Expected array of items in response');
    }

    return items.map(mapItemToAllowedValue);
  } catch (error) {
    Debugger.log(`Error getting Attio allowed values:`, error);
    throw new AttioError(`Failed to get Attio allowed values: ${error}`);
  }
};

export const AttioPersonRequiredFields = ['name', 'company'];
export const AttioCompanyRequiredFields = ['name'];
