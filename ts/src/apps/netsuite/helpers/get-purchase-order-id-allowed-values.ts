import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

type TNetsuitePurchaseOrderData = {
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

const mapNetSuitePurchaseOrder = (
  purchaseOrder: TNetsuitePurchaseOrderData
): IQoreAllowedValue => ({
  value: purchaseOrder.id,
  display_name: purchaseOrder.trandisplayname,
  desc:
    `ID: ${purchaseOrder.id}\n\nForeign Total: ${purchaseOrder.foreigntotal}\n\n` +
    `Created Date: ${purchaseOrder.createddate}\n\nStatus: ${purchaseOrder.status}\n\n` +
    `Transaction ID: ${purchaseOrder.tranid}\n\nTransaction Number: ${purchaseOrder.transactionnumber}\n\n` +
    `Memo: ${purchaseOrder.memo}`,
});

export const getNetsuitePurchaseOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, account_id },
  } = context;

  const purchaseOrders: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore && purchaseOrders.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite journal entries fetching timeout');

        break;
      }

      const { items: fetchedPurchaseOrders, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'PurchOrd' ORDER BY createddate DESC`,
      });

      purchaseOrders.push(...fetchedPurchaseOrders.map(mapNetSuitePurchaseOrder));

      hasMore = more;
      offset += fetchedPurchaseOrders.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return purchaseOrders;
  } catch (error) {
    Debugger.log('Error fetching Netsuite journal entries:', error);

    return purchaseOrders;
  }
};
