import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TNetsuiteSalesOrderData = {
  id: string;
  foreigntotal: string;
  createddate: string;
  status: string;
  tranid: string;
  transactionnumber: string;
  memo: string;
  trandisplayname: string;
};

const TOTAL_LIMIT = 500;

const fieldsToFetch = [
  'id',
  'foreigntotal',
  'createddate',
  'status',
  'tranid',
  'transactionnumber',
  'memo',
  'trandisplayname',
];

const mapNetSuiteSalesOrder = (salesOrder: TNetsuiteSalesOrderData): IQoreAllowedValue => ({
  value: salesOrder.id,
  display_name: salesOrder.trandisplayname,
  desc:
    `ID: ${salesOrder.id}\n\nForeign Total: ${salesOrder.foreigntotal}\n\n` +
    `Created Date: ${salesOrder.createddate}\n\nStatus: ${salesOrder.status}\n\n` +
    `Transaction ID: ${salesOrder.tranid}\n\nTransaction Number: ${salesOrder.transactionnumber}\n\n` +
    `Memo: ${salesOrder.memo}`,
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

    while (hasMore && salesOrders.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite sales order fetching timeout');

        break;
      }

      const { items: fetchedSalesOrders, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM transaction  WHERE type = 'SalesOrd' ORDER BY createddate DESC`,
      });

      salesOrders.push(...fetchedSalesOrders.map(mapNetSuiteSalesOrder));

      hasMore = more;
      offset += fetchedSalesOrders.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return salesOrders;
  } catch (error) {
    Debugger.log('Error fetching Netsuite sales orders:', error);

    return salesOrders;
  }
};
