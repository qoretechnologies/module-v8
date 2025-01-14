import { QorusRequest } from '@qoretechnologies/ts-toolkit';

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
