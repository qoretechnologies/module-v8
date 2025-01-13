import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuiteSalesOrderData = {
  id: string;
  tranId: string;
  tranDate: string;
  total: number;
};

const fetchNetsuiteSalesOrders = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ salesOrders: TNetsuiteSalesOrderData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/salesOrder`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: salesOrders, count, hasMore } = data;

  return { salesOrders, count, hasMore };
};

const mapNetSuiteSalesOrder = (salesOrder: TNetsuiteSalesOrderData): IQoreAllowedValue => ({
  value: salesOrder.id,
  display_name: `${salesOrder.tranId} - ${salesOrder.total}`,
  desc:
    `ID: ${salesOrder.id}\n\nTransaction ID: ${salesOrder.tranId}\n\n` +
    `Total: ${salesOrder.total}\n\nTransaction Date: ${salesOrder.tranDate}`,
});

export const getNetsuiteSalesOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, account_id },
  } = context;

  const salesOrders: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite sales order fetching timeout');

        break;
      }

      const { salesOrders: fetchedSalesOrders, hasMore: more } = await fetchNetsuiteSalesOrders({
        accountId: account_id,
        token,
        offset,
      });

      salesOrders.push(...fetchedSalesOrders.map(mapNetSuiteSalesOrder));

      hasMore = more;
      offset += fetchedSalesOrders.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite sales orders:', error);

    return salesOrders;
  }
};
