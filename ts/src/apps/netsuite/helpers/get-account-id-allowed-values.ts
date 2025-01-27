import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

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

  const accounts = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteAccount,
    query: `SELECT ${fieldsToFetch.join(',')} FROM account ORDER BY account.lastmodifieddate DESC`,
  });

  return accounts;
};
