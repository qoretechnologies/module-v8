import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
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
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite sales order allowed values'
    );
  }

  const salesOrders = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteSalesOrder,
    query: `SELECT ${fieldsToFetch.join(',')} FROM transaction  WHERE type = 'SalesOrd' ORDER BY createddate DESC`,
  });

  return salesOrders;
};
