import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
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
  const {
    conn_opts: { token, account_id },
  } = context;

  const vendors = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuitevendor,
    query: `SELECT ${fieldsToFetch.join(',')} FROM vendor ORDER BY vendor.datecreated DESC`,
  });

  return vendors;
};
