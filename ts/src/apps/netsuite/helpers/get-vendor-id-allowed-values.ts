import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuitevendorData = {
  id: string;
  email: string;
  phone: string;
  balance: number;
  image: string;
  firstName: string;
  lastName: string;
};

const fetchNetsuitevendors = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ vendors: TNetsuitevendorData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/vendor`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: vendors, count, hasMore } = data;

  return { vendors, count, hasMore };
};

const mapNetSuitevendor = (vendor: TNetsuitevendorData): IQoreAllowedValue => ({
  value: vendor.id,
  display_name: `${vendor.firstName} - ${vendor.lastName}`,
  ...(vendor.image && { image: vendor.image }),
  desc: `ID: ${vendor.id}\n\nEmail: ${vendor.email}\n\nPhone: ${vendor.phone}\n\nBalance: ${vendor.balance}`,
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

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite vendor fetching timeout');

        break;
      }

      const { vendors: fetchedvendors, hasMore: more } = await fetchNetsuitevendors({
        accountId: account_id,
        token,
        offset,
      });

      vendors.push(...fetchedvendors.map(mapNetSuitevendor));

      hasMore = more;
      offset += fetchedvendors.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite vendor:', error);

    return vendors;
  }
};
