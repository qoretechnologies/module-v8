import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksPaymentFieldsAllowedValues = [
  { value: 'PaymentRefNum', display_name: 'Payment Reference Number' },
  { value: 'TotalAmt', display_name: 'Total Amount' },
  { value: 'UnappliedAmt', display_name: 'Unapplied Amount' },
  { value: 'ProcessPayment', display_name: 'Process Payment' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Payment ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'TxnDate', display_name: 'Transaction Date' },
  { value: 'Line', display_name: 'Line Items' },
] satisfies IQoreAllowedValue<string>[];
