import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

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

const TOTAL_LIMIT = 500;

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

  const invoices: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore && invoices.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite invoice fetching timeout');

        break;
      }

      const { items: fetchedInvoices, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q:
          `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'CustInvc'` +
          ` ORDER BY transaction.createddate DESC`,
      });

      invoices.push(...fetchedInvoices.map(mapNetSuiteInvoice));

      hasMore = more;
      offset += fetchedInvoices.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return invoices;
  } catch (error) {
    Debugger.log('Error fetching Netsuite invoice:', error);

    return invoices;
  }
};
