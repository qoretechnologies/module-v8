import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Invoice } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksInvoiceToAllowedValue = (invoice: Invoice): IQoreAllowedValue<string> => {
  const customerName = invoice.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = invoice.TotalAmt || 0;
  const balance = invoice.Balance || 0;
  const dueDate = invoice.DueDate || 'No due date';
  const docNumber = invoice.DocNumber || 'No document number';

  const isPaid = balance === 0;
  const isOverdue = !isPaid && dueDate !== 'No due date' && new Date(dueDate) < new Date();
  const status = isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Open';

  return {
    value: invoice.Id!,
    display_name: `${customerName} - $${totalAmount} (${docNumber})`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Balance: $${balance}\n` +
      `Status: ${status}`,
  };
};

export const getQuickbooksInvoiceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allInvoices: Invoice[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const invoices = await client.findInvoices({
      desc: 'MetaData.CreateTime',
    });

    allInvoices.push(...(invoices.QueryResponse.Invoice || []));
    total = invoices.QueryResponse.maxResults || 0;

    while (
      allInvoices.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allInvoices.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const invoices = await client.findInvoices({
        desc: 'MetaData.CreateTime',
        offset: allInvoices.length,
      });

      allInvoices.push(...(invoices.QueryResponse.Invoice || []));
      total = invoices.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch invoices: ${error}`);
  }

  return allInvoices.map(mapQuickbooksInvoiceToAllowedValue);
};
