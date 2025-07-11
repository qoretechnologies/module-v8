import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { RefundReceipt } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksRefundReceiptToAllowedValue = (
  refundReceipt: RefundReceipt
): IQoreAllowedValue<string> => {
  const customerName = refundReceipt.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = refundReceipt.TotalAmt || 0;
  const txnDate = refundReceipt.TxnDate || 'No transaction date';
  const docNumber = refundReceipt.DocNumber || 'No document number';
  const paymentMethodName = refundReceipt.PaymentMethodRef?.name || 'Unknown Method';
  const refNum = refundReceipt.PaymentRefNum || '';

  const displaySuffix = refNum ? ` (${refNum})` : ` (${docNumber})`;

  return {
    value: refundReceipt.Id!,
    display_name: `${customerName} - $${totalAmount}${displaySuffix}`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Method: ${paymentMethodName}`,
  };
};

export const getQuickbooksRefundReceiptIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allRefundReceipts: RefundReceipt[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const refundReceipts = await client.findRefundReceipts({
      desc: 'MetaData.CreateTime',
    });

    allRefundReceipts.push(...(refundReceipts.QueryResponse.RefundReceipt || []));
    total = refundReceipts.QueryResponse.maxResults || 0;

    while (
      allRefundReceipts.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allRefundReceipts.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const refundReceipts = await client.findRefundReceipts({
        desc: 'MetaData.CreateTime',
        offset: allRefundReceipts.length,
      });

      allRefundReceipts.push(...(refundReceipts.QueryResponse.RefundReceipt || []));
      total = refundReceipts.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch refund receipts: ${error}`);
  }

  return allRefundReceipts.map(mapQuickbooksRefundReceiptToAllowedValue);
};
