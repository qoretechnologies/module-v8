// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Payment } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

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

  const allPayments = await fetchQuickbooksRecords<Payment>(
    (query) => client.findPayments(query),
    'Payment'
  );

  return allPayments.map(mapQuickbooksPaymentToAllowedValue);
};
