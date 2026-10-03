// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JournalEntry } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksJournalEntryToAllowedValue = (
  journalEntry: JournalEntry
): IQoreAllowedValue<string> => {
  const txnDate = journalEntry.TxnDate || 'No transaction date';
  const docNumber = journalEntry.DocNumber || 'No document number';
  const totalAmount = journalEntry.TotalAmt || 0;
  const privateNote = journalEntry.PrivateNote || '';

  const shortNote = privateNote.length > 30 ? privateNote.substring(0, 30) + '...' : privateNote;
  const description = shortNote || 'No description';

  return {
    value: journalEntry.Id!,
    display_name: `${docNumber} - $${totalAmount} (${txnDate})`,
    desc:
      `Doc Number: ${docNumber}\n` +
      `Date: ${txnDate}\n` +
      `Amount: $${totalAmount}\n` +
      `Description: ${description}`,
  };
};

export const getQuickbooksJournalEntryIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allJournalEntries = await fetchQuickbooksRecords<JournalEntry>(
    (query) => client.findJournalEntries(query),
    'JournalEntry'
  );

  return allJournalEntries.map(mapQuickbooksJournalEntryToAllowedValue);
};
