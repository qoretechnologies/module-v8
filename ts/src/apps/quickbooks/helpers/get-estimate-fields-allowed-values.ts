import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksEstimateFieldsAllowedValues = [
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Estimate ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'CustomField', display_name: 'Custom Fields' },
  { value: 'DocNumber', display_name: 'Document Number' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
  { value: 'TxnStatus', display_name: 'Transaction Status' },
  { value: 'LinkedTxn', display_name: 'Linked Transactions' },
  { value: 'FreeFormAddress', display_name: 'Free Form Address' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
  { value: 'ApplyTaxAfterDiscount', display_name: 'Apply Tax After Discount' },
  { value: 'PrintStatus', display_name: 'Print Status' },
  { value: 'EmailStatus', display_name: 'Email Status' },
] satisfies IQoreAllowedValue<string>[];
