import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuitevendorData = {
  id: string;
  companyname: string;
  balance: string;
};

const fieldsToFetch = ['id', 'companyname', 'balance'];

const mapNetSuitevendor = (vendor: TNetsuitevendorData): IQoreAllowedValue => ({
  value: vendor.id,
  display_name: vendor.companyname,
  desc: `ID: ${vendor.id}\n\nCompany Name: ${vendor.companyname}\n\nBalance: ${vendor.balance}`,
});

export const getNetsuitevendorIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id are required to get NetSuite vendor allowed values');
  }

  const vendors = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuitevendor,
    query: `SELECT ${fieldsToFetch.join(',')} FROM vendor ORDER BY vendor.datecreated DESC`,
  });

  return vendors;
};
