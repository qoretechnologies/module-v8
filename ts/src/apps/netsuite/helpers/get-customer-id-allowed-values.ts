import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteCustomerData = {
  id: string;
  fullname: string;
  datecreated: string;
};

const fieldsToFetch = ['id', 'fullname', 'datecreated'];

const mapNetSuiteCustomer = (customer: TNetsuiteCustomerData): IQoreAllowedValue => ({
  value: customer.id,
  display_name: customer.fullname,
  desc: `ID: ${customer.id}\n\nFull Name: ${customer.fullname}\n\nDate Created: ${customer.datecreated}`,
});

export const getNetsuiteCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id is required to get NetSuite customer allowed values');
  }

  const customers = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteCustomer,
    query: `SELECT ${fieldsToFetch.join(',')} FROM customer ORDER BY customer.datecreated DESC`,
  });

  return customers;
};
