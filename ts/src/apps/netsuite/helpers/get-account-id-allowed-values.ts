import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TNetsuiteAccountData = {
  id: string;
  displaynamewithhierarchy: string;
  accountsearchdisplayname: string;
  accttype: string;
  cashflowrate: string;
};

const fieldsToFetch = [
  'id',
  'displaynamewithhierarchy',
  'accountsearchdisplayname',
  'accttype',
  'cashflowrate',
  'lastmodifieddate',
];

const TOTAL_LIMIT = 500;

const mapNetSuiteAccount = (account: TNetsuiteAccountData): IQoreAllowedValue => ({
  value: account.id,
  display_name: account.accountsearchdisplayname,
  desc:
    `ID: ${account.id}\n\nDisplay Name: ${account.displaynamewithhierarchy}\n\n` +
    `Type: ${account.accttype}\n\nCash Flow Rate: ${account.cashflowrate}`,
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

    while (hasMore && accounts.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite accounts fetching timeout');

        break;
      }

      const { items: fetchedAccounts, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM account ORDER BY account.lastmodifieddate DESC`,
      });

      accounts.push(...fetchedAccounts.map(mapNetSuiteAccount));

      hasMore = more;
      offset += fetchedAccounts.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return accounts;
  } catch (error) {
    Debugger.log('Error fetching Netsuite accounts:', error);

    return accounts;
  }
};
