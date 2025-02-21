import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';

export const HUBSPOT_ALLOWED_VALUES_TIMEOUT = 60_000;
export const HUBSPOT_ALLOWED_VALUES_FETCH_DELAY = 300;

export type TFetchHubspotAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object: string;
  properties?: string[];
  limit?: number;
  maxResults?: number;
  sort?: {
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  };
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<string>;
};

type THubspotObjectsResponse<ItemType = unknown> = {
  results: ItemType[];
  paging?: { next: { after: string } };
};

export const fetchHubspotAllowedValues = async <ItemType = unknown>(
  options: TFetchHubspotAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<string>[]> => {
  const items = await fetchHubspotRecords(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchHubspotRecords = async <ItemType = unknown>(
  options: Omit<TFetchHubspotAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { object, token } = options;

  const items: ItemType[] = [];
  let after: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = options.maxResults || 200;
  const limit = options.limit || 100;

  try {
    do {
      if (Date.now() - startTime > HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching hubspot allowed values for ${object}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const body: Record<string, any> = {
        limit: limit.toString(),
      };

      if (options.properties?.length) {
        body.properties = options.properties;
      }

      if (after) {
        body.after = after;
      }

      if (options.sort) {
        body.sorts = [options.sort];
      }

      const response = await QorusRequest.post<{
        data: THubspotObjectsResponse<ItemType>;
      }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/crm/v3/objects/${object}/search`,
          data: body,
        },
        {
          url: `https://api.hubapi.com`,
          endpointId: 'Hubspot',
        }
      );

      const responseData: THubspotObjectsResponse<ItemType> | undefined = response?.data;

      if (!responseData?.results?.length) {
        break;
      }

      after = responseData?.paging?.next.after;

      items.push(...responseData.results);

      if (after) {
        await delay(HUBSPOT_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (after);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching hubspot records for ${object}`, error);

    return items;
  }

  return items;
};
