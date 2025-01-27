import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
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
  const {
    conn_opts: { token, account_id },
  } = context;

  const customers = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteCustomer,
    query: `SELECT ${fieldsToFetch.join(',')} FROM customer ORDER BY customer.datecreated DESC`,
  });

  return customers;
};
