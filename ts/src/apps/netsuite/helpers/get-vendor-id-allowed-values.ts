import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuitevendorData = {
  id: string;
  companyname: string;
  balance: string;
};

const fieldsToFetch = ['id', 'companyname', 'balance'];

const mapNetSuiteVendor = (vendor: TNetsuitevendorData): IQoreAllowedValue => ({
  value: vendor.id,
  display_name: vendor.companyname,
  desc: `ID: ${vendor.id}\n\nCompany Name: ${vendor.companyname}\n\nBalance: ${vendor.balance}`,
});

const mapNetSuiteVendorObject = (vendor: TNetsuitevendorData): IQoreAllowedValue => ({
  value: { id: vendor.id },
  display_name: vendor.companyname,
  desc: `ID: ${vendor.id}\n\nCompany Name: ${vendor.companyname}\n\nBalance: ${vendor.balance}`,
});

const createGetNetsuitevendorIdAllowedValuesFunction = (
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, any> => {
  return async (context): Promise<IQoreAllowedValue[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error(
        'The token and account_id are required to get NetSuite vendor allowed values'
      );
    }

    const vendors = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: type === 'string' ? mapNetSuiteVendor : mapNetSuiteVendorObject,
      query: `SELECT ${fieldsToFetch.join(',')} FROM vendor ORDER BY vendor.datecreated DESC`,
    });

    return vendors;
  };
};

export const getNetsuiteVendorIdAllowedValues =
  createGetNetsuitevendorIdAllowedValuesFunction('string');

export const getNetsuiteVendorObjectAllowedValues =
  createGetNetsuitevendorIdAllowedValuesFunction('object');
