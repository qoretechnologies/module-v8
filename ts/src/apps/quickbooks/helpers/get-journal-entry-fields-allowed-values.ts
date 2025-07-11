import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksJournalEntryFieldsAllowedValues = [
  { value: 'Adjustment', display_name: 'Adjustment' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Journal Entry ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
  { value: 'PrivateNote', display_name: 'Private Note' },
  { value: 'Line', display_name: 'Line Items' },
  { value: 'TxnTaxDetail', display_name: 'Transaction Tax Detail' },
] satisfies IQoreAllowedValue<string>[];
