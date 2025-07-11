import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksDepositFieldsAllowedValues = [
  { value: 'TotalAmt', display_name: 'Total Amount' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Deposit ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
] satisfies IQoreAllowedValue<string>[];
