import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuiteCustomerData = {
  id: string;
  image: string;
  url: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  title: string;
  accountNumber: string;
};

const fetchNetsuiteCustomers = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ customers: TNetsuiteCustomerData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/customer`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: customers, count, hasMore } = data;

  return { customers, count, hasMore };
};

const mapNetSuiteCustomer = (customer: TNetsuiteCustomerData): IQoreAllowedValue => ({
  value: customer.id,
  display_name: `${customer.firstName} ${customer.lastName}`,
  ...(customer.image && { image: customer.image }),
  desc:
    `ID: ${customer.id}\n\nEmail: ${customer.email}\n\nPhone: ${customer.phone}\n\n` +
    `Title: ${customer.title}\n\nAccount number: ${customer.accountNumber}`,
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

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite customer fetching timeout');

        break;
      }

      const { customers: fetchedCustomers, hasMore: more } = await fetchNetsuiteCustomers({
        accountId: account_id,
        token,
        offset,
      });

      customers.push(...fetchedCustomers.map(mapNetSuiteCustomer));

      hasMore = more;
      offset += fetchedCustomers.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite customers:', error);

    return customers;
  }
};
