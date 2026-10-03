// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Bill } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksBillToAllowedValue = (bill: Bill): IQoreAllowedValue<string> => {
  const vendorName = bill.VendorRef?.name || 'Unknown Vendor';
  const totalAmount = bill.TotalAmt || 0;
  const dueDate = bill.DueDate || 'No due date';
  const billNumber = bill.DocNumber || 'No bill number';

  return {
    value: bill.Id!,
    display_name: `${vendorName} - $${totalAmount} (${billNumber})`,
    desc: `Vendor: ${vendorName}\nAmount: $${totalAmount}\nDue Date: ${dueDate}\nBill Number: ${billNumber}`,
  };
};

export const getQuickbooksBillIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allBills = await fetchQuickbooksRecords<Bill>((query) => client.findBills(query), 'Bill');

  return allBills.map(mapQuickbooksBillToAllowedValue);
};
