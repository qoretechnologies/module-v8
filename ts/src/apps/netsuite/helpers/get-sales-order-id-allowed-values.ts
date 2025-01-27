import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

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

  const salesOrders = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteSalesOrder,
    query: `SELECT ${fieldsToFetch.join(',')} FROM transaction  WHERE type = 'SalesOrd' ORDER BY createddate DESC`,
  });

  return salesOrders;
};
