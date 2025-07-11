import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Payment } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksPaymentToAllowedValue = (payment: Payment): IQoreAllowedValue<string> => {
  const customerName = payment.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = payment.TotalAmt || 0;
  const txnDate = payment.TxnDate || 'No transaction date';
  const paymentMethodName = payment.PaymentMethodRef?.name || 'Unknown Method';
  const paymentRefNum = payment.PaymentRefNum || '';

  const displaySuffix = paymentRefNum ? ` (${paymentRefNum})` : ` (${txnDate})`;

  return {
    value: payment.Id!,
    display_name: `${customerName} - $${totalAmount}${displaySuffix}`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Method: ${paymentMethodName}`,
  };
};

export const getQuickbooksPaymentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allPayments: Payment[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const payments = await client.findPayments({
      desc: 'MetaData.CreateTime',
    });

    allPayments.push(...(payments.QueryResponse.Payment || []));
    total = payments.QueryResponse.maxResults || 0;

    while (
      allPayments.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allPayments.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const payments = await client.findPayments({
        desc: 'MetaData.CreateTime',
        offset: allPayments.length,
      });

      allPayments.push(...(payments.QueryResponse.Payment || []));
      total = payments.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch payments: ${error}`);
  }

  return allPayments.map(mapQuickbooksPaymentToAllowedValue);
};
