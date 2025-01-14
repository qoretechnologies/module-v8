import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TNetsuiteCustomerData = {
  id: string;
  fullname: string;
  datecreated: string;
};

const fieldsToFetch = ['id', 'fullname', 'datecreated'];

const TOTAL_LIMIT = 500;

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

  const customers: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore && customers.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite customer fetching timeout');

        break;
      }

      const { items: fetchedCustomers, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM customer ORDER BY customer.datecreated DESC`,
      });

      customers.push(...fetchedCustomers.map(mapNetSuiteCustomer));

      hasMore = more;
      offset += fetchedCustomers.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return customers;
  } catch (error) {
    Debugger.log('Error fetching Netsuite customers:', error);

    return customers;
  }
};
