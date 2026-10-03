// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Deposit } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksDepositToAllowedValue = (deposit: Deposit): IQoreAllowedValue<string> => {
  const totalAmount = deposit.TotalAmt || 0;
  const txnDate = deposit.TxnDate || 'No transaction date';
  const depositToAccount = deposit.DepositToAccountRef?.name || 'Unknown Account';
  const memo = deposit.PrivateNote || '';

  const lineCount = deposit.Line?.length || 0;
  const lineItemsText = lineCount === 1 ? '1 item' : `${lineCount} items`;

  return {
    value: deposit.Id!,
    display_name: `$${totalAmount} to ${depositToAccount} (${txnDate})`,
    desc:
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Account: ${depositToAccount}\n` +
      `Items: ${lineItemsText}` +
      (memo ? `\nMemo: ${memo}` : ''),
  };
};

export const getQuickbooksDepositIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allDeposits = await fetchQuickbooksRecords<Deposit>(
    (query) => client.findDeposits(query),
    'Deposit'
  );

  return allDeposits.map(mapQuickbooksDepositToAllowedValue);
};
