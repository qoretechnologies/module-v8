import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksBillFieldsAllowedValues = [
  { value: 'DueDate', display_name: 'Due Date' },
  { value: 'Balance', display_name: 'Balance' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Bill ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
  { value: 'PrivateNote', display_name: 'Private Note' },
  { value: 'LinkedTxn', display_name: 'Linked Transactions' },
  { value: 'Line', display_name: 'Line Items' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
] satisfies IQoreAllowedValue<string>[];
