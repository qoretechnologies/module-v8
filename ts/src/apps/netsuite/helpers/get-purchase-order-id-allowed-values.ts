import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

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
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite purchase order allowed values'
    );
  }

  const purchaseOrders = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuitePurchaseOrder,
    query: `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'PurchOrd' ORDER BY createddate DESC`,
  });

  return purchaseOrders;
};
