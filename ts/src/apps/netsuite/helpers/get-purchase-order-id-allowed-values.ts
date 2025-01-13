import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuitePurchaseOrderData = {
  id: string;
  tranId: string;
  tranDate: string;
  total: number;
  memo: string;
};

const fetchNetsuitePurchaseOrders = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ purchaseOrders: TNetsuitePurchaseOrderData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/purchaseOrder`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: purchaseOrders, count, hasMore } = data;

  return { purchaseOrders, count, hasMore };
};

const mapNetSuitePurchaseOrder = (
  purchaseOrder: TNetsuitePurchaseOrderData
): IQoreAllowedValue => ({
  value: purchaseOrder.id,
  display_name: `${purchaseOrder.tranId}  - ${purchaseOrder.tranDate}`,
  desc:
    `ID: ${purchaseOrder.id}\n\nTransaction ID: ${purchaseOrder.tranId}\n\n` +
    `Transaction Date: ${purchaseOrder.tranDate}\n\nMemo: ${purchaseOrder.memo}`,
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

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite journal entries fetching timeout');

        break;
      }

      const { purchaseOrders: fetchedPurchaseOrders, hasMore: more } =
        await fetchNetsuitePurchaseOrders({
          accountId: account_id,
          token,
          offset,
        });

      purchaseOrders.push(...fetchedPurchaseOrders.map(mapNetSuitePurchaseOrder));

      hasMore = more;
      offset += fetchedPurchaseOrders.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite journal entries:', error);

    return purchaseOrders;
  }
};
