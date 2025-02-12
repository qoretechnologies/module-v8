import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

export const HUBSPOT_ALLOWED_VALUES_TIMEOUT = 60_000;

export type TFetchHubspotAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  object: string;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<string>;
};

type THubspotObjectsResponse<ItemType = unknown> = {
  results: ItemType[];
  paging: { after: string };
};

export const fetchHubspotAllowedValues = async <ItemType = unknown>(
  options: TFetchHubspotAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<string>[]> => {
  const { object, token } = options;

  const items: IQoreAllowedValue<string>[] = [];
  let after: string | undefined = undefined;
  const startTime = Date.now();
  const maxResults = 200;
  const limit = 100;

  try {
    do {
      if (Date.now() - startTime > HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching hubspot allowed values for ${object}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const params: Record<string, string> = {
        limit: limit.toString(),
      };

      if (after) {
        params.after = after;
      }

      const response = await QorusRequest.get<{
        data: THubspotObjectsResponse<ItemType>;
      }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/crm/v3/objects/${object}`,
          params,
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

      if (responseData.paging?.after) {
        after = responseData.paging.after;
      }

      items.push(...responseData.results.map(options.mapItemToAllowedValue));
    } while (after);
  } catch (error) {
    Debugger.log(`Error fetching hubspot allowed values for ${object}`, error);

    return items;
  }

  return items;
};
