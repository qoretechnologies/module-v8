import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
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
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id is required to get NetSuite account allowed values');
  }

  const accounts = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteAccount,
    query: `SELECT ${fieldsToFetch.join(',')} FROM account ORDER BY account.lastmodifieddate DESC`,
  });

  return accounts;
};
