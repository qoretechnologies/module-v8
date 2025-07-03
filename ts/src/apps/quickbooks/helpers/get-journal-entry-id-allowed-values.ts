import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JournalEntry } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

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

  const allJournalEntries: JournalEntry[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const journalEntries = await client.findJournalEntries({
      desc: 'MetaData.CreateTime',
    });

    allJournalEntries.push(...(journalEntries.QueryResponse.JournalEntry || []));
    total = journalEntries.QueryResponse.maxResults || 0;

    while (
      allJournalEntries.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allJournalEntries.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const journalEntries = await client.findJournalEntries({
        desc: 'MetaData.CreateTime',
        offset: allJournalEntries.length,
      });

      allJournalEntries.push(...(journalEntries.QueryResponse.JournalEntry || []));
      total = journalEntries.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch journal entries: ${error}`);
  }

  return allJournalEntries.map(mapQuickbooksJournalEntryToAllowedValue);
};
