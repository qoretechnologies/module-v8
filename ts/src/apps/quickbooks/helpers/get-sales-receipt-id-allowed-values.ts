import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { SalesReceipt } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksSalesReceiptToAllowedValue = (
  salesReceipt: SalesReceipt
): IQoreAllowedValue<string> => {
  const customerName = salesReceipt.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = salesReceipt.TotalAmt || 0;
  const txnDate = salesReceipt.TxnDate || 'No transaction date';
  const docNumber = salesReceipt.DocNumber || 'No document number';
  const paymentMethodName = salesReceipt.PaymentMethodRef?.name || 'Unknown Method';
  const paymentRefNum = salesReceipt.PaymentRefNum || '';

  const displaySuffix = paymentRefNum ? ` (${paymentRefNum})` : ` (${docNumber})`;

  return {
    value: salesReceipt.Id!,
    display_name: `${customerName} - $${totalAmount}${displaySuffix}`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Method: ${paymentMethodName}`,
  };
};

export const getQuickbooksSalesReceiptIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allSalesReceipts: SalesReceipt[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const salesReceipts = await client.findSalesReceipts({
      desc: 'MetaData.CreateTime',
    });

    allSalesReceipts.push(...(salesReceipts.QueryResponse.SalesReceipt || []));
    total = salesReceipts.QueryResponse.maxResults || 0;

    while (
      allSalesReceipts.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allSalesReceipts.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const salesReceipts = await client.findSalesReceipts({
        desc: 'MetaData.CreateTime',
        offset: allSalesReceipts.length,
      });

      allSalesReceipts.push(...(salesReceipts.QueryResponse.SalesReceipt || []));
      total = salesReceipts.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch sales receipts: ${error}`);
  }

  return allSalesReceipts.map(mapQuickbooksSalesReceiptToAllowedValue);
};
