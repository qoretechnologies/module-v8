// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Purchase } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksPurchaseToAllowedValue = (purchase: Purchase): IQoreAllowedValue<string> => {
  const entityName = purchase.EntityRef?.name || 'Unknown Entity';
  const totalAmount = purchase.TotalAmt || 0;
  const txnDate = purchase.TxnDate || 'No transaction date';
  const paymentType = purchase.PaymentType || 'Unknown Payment';
  const docNumber = purchase.DocNumber || '';

  const displaySuffix = docNumber ? ` (${docNumber})` : ` (${txnDate})`;

  return {
    value: purchase.Id!,
    display_name: `${entityName} - $${totalAmount}${displaySuffix}`,
    desc:
      `Entity: ${entityName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Payment: ${paymentType}`,
  };
};

export const getQuickbooksPurchaseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allPurchases = await fetchQuickbooksRecords<Purchase>(
    (query) => client.findPurchases(query),
    'Purchase'
  );

  return allPurchases.map(mapQuickbooksPurchaseToAllowedValue);
};
