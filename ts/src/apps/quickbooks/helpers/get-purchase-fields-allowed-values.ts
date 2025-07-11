import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksPurchaseFieldsAllowedValues = [
  { value: 'PaymentType', display_name: 'Payment Type' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
  { value: 'PrintStatus', display_name: 'Print Status' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Purchase ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'DocNumber', display_name: 'Document Number' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
] satisfies IQoreAllowedValue<string>[];
