import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { HUBSPOT_ALLOWED_VALUES_FETCH_DELAY, HUBSPOT_ALLOWED_VALUES_TIMEOUT } from './constants';

type THubspotList = {
  listId: string;
  name: string;
  listVersion: number;
  objectTypeId: string;
  processingType: string;
};

export const fetchHubspotLists = async (token: string): Promise<THubspotList[]> => {
  const items: THubspotList[] = [];
  let offset: number | undefined = undefined;
  let hasMore: boolean = true;
  const startTime = Date.now();
  const maxResults = 1000;
  const limit = 100;

  try {
    do {
      if (Date.now() - startTime > HUBSPOT_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching hubspot allowed values for lists`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const body: Record<string, any> = {
        limit: limit.toString(),
      };

      if (offset) {
        body.offset = offset;
      }

      const response = await QorusRequest.post<{
        data: { hasMore: boolean; offset: number; lists: THubspotList[] };
      }>(
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          path: `/crm/v3/lists/search`,
          data: body,
        },
        {
          url: `https://api.hubapi.com`,
          endpointId: 'Hubspot',
        }
      );

      const responseData: { hasMore: boolean; offset: number; lists: THubspotList[] } | undefined =
        response?.data;

      hasMore = responseData?.hasMore ?? false;

      if (!responseData?.lists?.length) {
        break;
      }

      offset = responseData?.offset;

      items.push(...responseData.lists);

      if (offset) {
        await delay(HUBSPOT_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (hasMore);
  } catch (error) {
    console.error(error);
    Debugger.log(`Error fetching hubspot records for lists`, error);

    return items;
  }

  return items;
};

const mapHubspotList = (list: THubspotList): IQoreAllowedValue<string> => ({
  value: list.listId,
  display_name: list.name,
  desc:
    `List ID: ${list.listId}\nVersion: ${list.listVersion}\n` +
    `Object Type ID: ${list.objectTypeId}\nProcessing Type: ${list.processingType}`,
});

export const getHubspotListAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot list allowed values');
  }

  const lists = await fetchHubspotLists(token);

  return lists.map(mapHubspotList);
};
