import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteInvoiceData = {
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

const mapNetSuiteInvoice = (invoice: TNetsuiteInvoiceData): IQoreAllowedValue => ({
  value: invoice.id,
  display_name: invoice.trandisplayname,
  desc:
    `ID: ${invoice.id}\n\nForeign Total: ${invoice.foreigntotal}\n\n` +
    `Created Date: ${invoice.createddate}\n\nStatus: ${invoice.status}\n\n` +
    `Transaction ID: ${invoice.tranid}\n\nTransaction Number: ${invoice.transactionnumber}\n\n` +
    `Memo: ${invoice.memo}`,
});

export const getNetsuiteInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, account_id },
  } = context;

  const invoices = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteInvoice,
    query:
      `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'CustInvc'` +
      ` ORDER BY transaction.createddate DESC`,
  });

  return invoices;
};
