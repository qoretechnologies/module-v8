import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';

export const NETSUITE_ALLOWED_VALUES_FETCH_DELAY = 300;
export const NETSUITE_ALLOWED_VALUES_TIMEOUT = 30_000;

export type TFetchSuiteQlDataOptions = {
  token: string;
  accountId: string;
  limit?: number;
  offset?: number;
  q: string;
};

export type TNetsuiteSuiteQlData = {
  items: unknown[];
  count: number;
  hasMore: boolean;
};

export const fetchSuiteQlData = async (
  options: TFetchSuiteQlDataOptions
): Promise<TNetsuiteSuiteQlData> => {
  const { token, accountId, limit = 500, offset = 0, q } = options;

  const { data } = await QorusRequest.post<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: 'transient',
      },
      path: `/services/rest/query/v1/suiteql`,
      params: {
        offset: offset.toString(),
        limit: limit.toString(),
      },
      data: {
        q,
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  return { items: data.items, count: data.count, hasMore: data.hasMore };
};

export const fetchNetsuiteAllowedValues = async ({
  account_id,
  token,
  mapItemToAllowedValue,
  query,
}: {
  account_id: string;
  token: string;
  mapItemToAllowedValue: (item: unknown) => IQoreAllowedValue;
  query: string;
}): Promise<IQoreAllowedValue[]> => {
  const allowedValues: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;
  const limit = 1000;

  try {
    let hasMore = true;

    while (hasMore && allowedValues.length < limit) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite records fetching timeout');

        break;
      }

      const { items, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: query,
      });

      allowedValues.push(...items.map(mapItemToAllowedValue));

      hasMore = more;
      offset += items.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return allowedValues;
  } catch (error) {
    Debugger.log('Error fetching Netsuite records:', error);

    return allowedValues;
  }
};
