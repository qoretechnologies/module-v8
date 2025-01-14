import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TNetsuitevendorData = {
  id: string;
  companyname: string;
  balance: string;
};

const TOTAL_LIMIT = 500;

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

  const vendors: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore && vendors.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite vendor fetching timeout');

        break;
      }

      const { items: fetchedVendors, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM vendor ORDER BY vendor.datecreated DESC`,
      });

      vendors.push(...fetchedVendors.map(mapNetSuitevendor));

      hasMore = more;
      offset += fetchedVendors.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return vendors;
  } catch (error) {
    Debugger.log('Error fetching Netsuite vendor:', error);

    return vendors;
  }
};
