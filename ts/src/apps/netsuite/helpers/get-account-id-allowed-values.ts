import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';
import { delay } from '../../../global/helpers';

const DEFAULT_LIMIT = 1000;

type TNetsuiteAccountData = {
  id: string;
  accountSearchDisplayName: string;
  description: string;
};

const fetchNetsuiteAccounts = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ accounts: TNetsuiteAccountData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/account`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: accounts, count, hasMore } = data;

  return { accounts, count, hasMore };
};

const mapNetSuiteAccount = (account: TNetsuiteAccountData): IQoreAllowedValue => ({
  value: account.id,
  display_name: account.accountSearchDisplayName,
  desc: account.description,
});

export const getNetsuiteAccountIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, account_id },
  } = context;

  const accounts: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite accounts fetching timeout');

        break;
      }

      const { accounts: fetchedAccounts, hasMore: more } = await fetchNetsuiteAccounts({
        accountId: account_id,
        token,
        offset,
      });

      accounts.push(...fetchedAccounts.map(mapNetSuiteAccount));

      hasMore = more;
      offset += fetchedAccounts.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite accounts:', error);

    return accounts;
  }
};
