// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { CreditMemo } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksCreditMemoToAllowedValue = (
  creditMemo: CreditMemo
): IQoreAllowedValue<string> => {
  const customerName = creditMemo.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = creditMemo.TotalAmt || 0;
  const txnDate = creditMemo.TxnDate || 'No transaction date';
  const docNumber = creditMemo.DocNumber || 'No document number';
  const balance = creditMemo.Balance || 0;

  return {
    value: creditMemo.Id!,
    display_name: `${customerName} - $${totalAmount} (${docNumber})`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Balance: $${balance}\n` +
      `Date: ${txnDate}\n` +
      `Doc Number: ${docNumber}`,
  };
};

export const getQuickbooksCreditMemoIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allCreditMemos = await fetchQuickbooksRecords<CreditMemo>(
    (query) => client.findCreditMemos(query),
    'CreditMemo'
  );

  return allCreditMemos.map(mapQuickbooksCreditMemoToAllowedValue);
};
