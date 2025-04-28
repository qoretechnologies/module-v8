import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroInvoice = {
  InvoiceID: string;
  InvoiceNumber?: string;
  Reference?: string;
  Type: string;
  Status: string;
  AmountDue: number;
  AmountPaid: number;
  Total: number;
  CurrencyCode: string;
  Date: string;
  DueDate: string;
  Contact: {
    ContactID: string;
    Name: string;
  };
};

const mapXeroInvoiceToAllowedValue = (invoice: XeroInvoice): IQoreAllowedValue<string> => ({
  display_name: invoice.InvoiceNumber || invoice.Reference || invoice.InvoiceID,
  value: invoice.InvoiceID,
  desc:
    `Type: ${invoice.Type}\n\n` +
    `Status: ${invoice.Status}\n\n` +
    `Amount: ${invoice.Total} ${invoice.CurrencyCode}\n\n` +
    `Contact: ${invoice.Contact?.Name || 'Unknown'}`,
});

export const getXeroInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Invoices',
      dataPath: 'Invoices',
      mapItemToAllowedValue: mapXeroInvoiceToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero invoice IDs: ${error}`);
  }
};
