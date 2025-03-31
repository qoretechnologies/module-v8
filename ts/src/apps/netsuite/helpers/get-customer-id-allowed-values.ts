import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteCustomerData = {
  id: string;
  fullname: string;
  datecreated: string;
};

type TCustomerAllowedValue = {
  id: string;
};

const fieldsToFetch = ['id', 'fullname', 'datecreated'];

const mapNetSuiteCustomer = (customer: TNetsuiteCustomerData): IQoreAllowedValue<string> => ({
  value: customer.id,
  display_name: customer.fullname,
  desc: `ID: ${customer.id}\n\nFull Name: ${customer.fullname}\n\nDate Created: ${customer.datecreated}`,
});

const mapNetSuiteCustomerEntity = (
  customer: TNetsuiteCustomerData
): IQoreAllowedValue<TCustomerAllowedValue> => ({
  value: { id: customer.id },
  display_name: customer.fullname,
  desc: `ID: ${customer.id}\n\nFull Name: ${customer.fullname}\n\nDate Created: ${customer.datecreated}`,
});

const createNetsuiteCustomerIdAllowedValuesFunction = (
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, any> => {
  return async (context): Promise<IQoreAllowedValue<any>[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error(
        `The token and account_id are required to get NetSuite customer allowed values`
      );
    }

    const customers = (await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: type === 'object' ? mapNetSuiteCustomerEntity : mapNetSuiteCustomer,
      query: `SELECT ${fieldsToFetch.join(',')} FROM customer ORDER BY customer.datecreated DESC`,
    })) as IQoreAllowedValue<any>[];

    return customers;
  };
};

export const getNetsuiteCustomerEntityIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TCustomerAllowedValue
> = createNetsuiteCustomerIdAllowedValuesFunction('object');

export const getNetsuiteCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  string
> = createNetsuiteCustomerIdAllowedValuesFunction('string');
