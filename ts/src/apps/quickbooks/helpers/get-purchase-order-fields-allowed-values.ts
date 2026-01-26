import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksPurchaseOrderFieldsAllowedValues = [
  { value: 'EmailStatus', display_name: 'Email Status' },
  { value: 'POStatus', display_name: 'Purchase Order Status' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Purchase Order ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'DocNumber', display_name: 'Document Number' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
] satisfies IQoreAllowedValue<string>[];
