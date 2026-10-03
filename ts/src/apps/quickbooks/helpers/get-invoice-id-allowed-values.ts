// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Invoice } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

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

  const allInvoices = await fetchQuickbooksRecords<Invoice>(
    (query) => client.findInvoices(query),
    'Invoice'
  );

  return allInvoices.map(mapQuickbooksInvoiceToAllowedValue);
};
