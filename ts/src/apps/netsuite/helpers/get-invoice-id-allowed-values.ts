import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuiteInvoiceData = {
  id: string;
  email: string;
  status: string;
  total: number;
  tranId: string;
  tranDate: string;
  memo: string;
  message: string;
};

const fetchNetsuiteInvoices = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ invoices: TNetsuiteInvoiceData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/invoice`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: invoices, count, hasMore } = data;

  return { invoices, count, hasMore };
};

const mapNetSuiteInvoice = (invoice: TNetsuiteInvoiceData): IQoreAllowedValue => ({
  value: invoice.id,
  display_name: `${invoice.tranId} - ${invoice.total}`,
  desc:
    `ID: ${invoice.id}\n\nEmail: ${invoice.email}\n\nStatus: ${invoice.status}\n\n` +
    `Total: ${invoice.total}\n\nTransaction ID: ${invoice.tranId}\n\n` +
    `Transaction Date: ${invoice.tranDate}\n\nMemo: ${invoice.memo}\n\nMessage: ${invoice.message}`,
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

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite invoice fetching timeout');

        break;
      }

      const { invoices: fetchedInvoices, hasMore: more } = await fetchNetsuiteInvoices({
        accountId: account_id,
        token,
        offset,
      });

      invoices.push(...fetchedInvoices.map(mapNetSuiteInvoice));

      hasMore = more;
      offset += fetchedInvoices.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite invoice:', error);

    return invoices;
  }
};
