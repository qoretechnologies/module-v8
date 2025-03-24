import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';

export const PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY = 300;
export const PIPEDRIVE_ALLOWED_VALUES_TIMEOUT = 10_000;

export type TFetchPipedriveDataOptions = {
  token: string;
  limit?: number;
  offset?: number;
  path: string;
  params?: Record<string, string>;
};

export type TfetchPipedriveAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  path: string;
  params?: Record<string, string>;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<string>;
};

export type TPipedriveData<ItemType = unknown> = {
  data: ItemType[];
  success: boolean;
  error?: string;
  additional_data?: {
    more_items_in_collection: boolean;
    limit: number;
    start: number;
  };
};

/**
 * fetch Pipedrive data
 */

export const fetchPipedriveData = async <ItemType = unknown>(
  options: TFetchPipedriveDataOptions
): Promise<{ data: ItemType[]; hasMore: boolean }> => {
  try {
    const { token, limit = 100, offset = 0, path } = options;

    const response = await QorusRequest.get<{ data: TPipedriveData<ItemType> }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path,
        params: {
          start: offset.toString(),
          limit: limit.toString(),
          ...(options.params || {}),
        },
      },
      { endpointId: 'Pipedrive', url: 'https://api.pipedrive.com/v1' }
    );

    const responseData = response?.data;

    if (!responseData?.data || !responseData?.success) {
      throw new Error(
        `Failed to fetch data from Pipedrive: ${responseData?.error ? responseData.error : 'No data returned'} `
      );
    }

    return {
      data: responseData.data,
      hasMore: !!responseData.additional_data?.more_items_in_collection,
    };
  } catch (error) {
    throw new Error(`Failed to fetch data from Pipedrive: ${error}`);
  }
};

/**
 * Fetch Pipedrive allowed values
 */

export const fetchPipedriveAllowedValues = async <ItemType = unknown>(
  options: TfetchPipedriveAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<string>[]> => {
  const allowedValues: IQoreAllowedValue<string>[] = [];
  const startTime = Date.now();
  let start = 0;
  const limit = 500;

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > PIPEDRIVE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Pipedrive allowed values`);

        break;
      }

      const { data, hasMore: more } = await fetchPipedriveData({
        path: options.path,
        token: options.token,
        params: options.params,
        limit,
        offset: start,
      });

      allowedValues.push(...data.map(options.mapItemToAllowedValue));

      hasMore = more;
      start += data.length;

      if (hasMore) {
        await delay(PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log(`Failed to fetch Pipedrive allowed values: ${error}`);
  } finally {
    return allowedValues;
  }
};

/**
 * Get Pipedrive object fields
 */

type TPipedriveObjectField = {
  id: number;
  key: string;
  name: string;
  options: { id: number; label: string }[];
};

export const createGetPipedriveObjectPropertyAllowedValuesFunction = (
  pathToObjectFields: string,
  property: string
): TQoreGetAllowedValuesFunction<TCustomConnOptions, number> => {
  return async (context): Promise<IQoreAllowedValue<number>[]> => {
    const token = context?.conn_opts?.token;

    if (!token)
      throw new Error(
        `Token is required to get Pipedrive ${pathToObjectFields} ${property} allowed values`
      );

    const dealFields = await getPipedriveObjectFields(token, pathToObjectFields);

    const field = dealFields.find((field) => field.key === property);

    if (!field?.options?.length) {
      throw new Error(`There are no ${property} options in Pipedrive ${pathToObjectFields}`);
    }

    return field.options.map((option) => ({
      value: option.id,
      display_name: option.label,
    }));
  };
};

export const getPipedriveObjectFields = async (
  token: string,
  pathToObjectFields: string
): Promise<TPipedriveObjectField[]> => {
  const dealFields: TPipedriveObjectField[] = [];

  let start = 0;
  const limit = 500;
  const startTime = Date.now();

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > PIPEDRIVE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Pipedrive deal fields`);

        break;
      }

      const { data, hasMore: more } = await fetchPipedriveData<TPipedriveObjectField>({
        token,
        offset: start,
        limit,
        path: pathToObjectFields,
      });

      dealFields.push(...data);

      hasMore = more;
      start += data.length;

      if (hasMore) {
        await delay(PIPEDRIVE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log(`Failed to fetch Pipedrive deal fields: ${error}`);
  } finally {
    return dealFields;
  }
};
