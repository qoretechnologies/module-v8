// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { SalesReceipt } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

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

  const allSalesReceipts = await fetchQuickbooksRecords<SalesReceipt>(
    (query) => client.findSalesReceipts(query),
    'SalesReceipt'
  );

  return allSalesReceipts.map(mapQuickbooksSalesReceiptToAllowedValue);
};
