import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { BUSINESS_CENTRAL_APP_NAME } from '../constants';

export const BUSINESS_CENTRAL_ALLOWED_VALUES_TIMEOUT = 60_000;
export const BUSINESS_CENTRAL_ALLOWED_VALUES_FETCH_DELAY = 100;

export type TFetchBusinessCentralAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  dynamics_env: string;
  object: string;
  limit?: number;
  maxResults?: number;
  orderBy?: string;
  sortOrder?: 'asc' | 'desc';
  fields?: string[];
  filter?: {
    field: string;
    operator: string;
    value: string | number | boolean;
  };
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

type TBusinessCentralResponse<ItemType = unknown> = {
  '@odata.context': string;
  value: ItemType[];
};

export const fetchBusinessCentralAllowedValues = async <ItemType = unknown>(
  options: TFetchBusinessCentralAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchBusinessCentralRecords<ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchBusinessCentralRecords = async <ItemType = unknown>(
  options: Omit<TFetchBusinessCentralAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { object, token, dynamics_env } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const maxResults = options.maxResults || 1000;
  const limit = options.limit || 500;
  let offset = 0;
  let hasMore = true;

  try {
    do {
      if (Date.now() - startTime > BUSINESS_CENTRAL_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Business Central allowed values for ${object}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const path = `/v2.0/${dynamics_env}/api/v2.0/${object}`;

      const params: Record<string, string> = {
        $top: limit.toString(),
        $skip: offset.toString(),
      };

      if (options.fields && options.fields.length > 0) {
        params['$select'] = options.fields.join(',');
      }

      if (options.filter) {
        params.$filter = `${options.filter.field} ${options.filter.operator} '${options.filter.value}'`;
      }

      if (options.orderBy) {
        params.$orderby = `${options.orderBy} ${options.sortOrder || 'asc'}`;
      }

      const response = await QorusRequest.get<{ data: TBusinessCentralResponse<ItemType> }>(
        {
          path,
          params,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
        {
          url: 'https://api.businesscentral.dynamics.com',
          endpointId: BUSINESS_CENTRAL_APP_NAME,
        }
      );

      const data = response?.data?.value || [];

      items.push(...data);

      hasMore = data.length === limit;
      offset += limit;

      if (hasMore) {
        await delay(BUSINESS_CENTRAL_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (hasMore);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching Business Central records for ${object}`, error);

    return items;
  }

  return items;
};
