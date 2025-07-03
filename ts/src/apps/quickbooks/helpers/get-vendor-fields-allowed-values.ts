import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksVendorFieldsAllowedValues = [
  { value: 'Balance', display_name: 'Balance' },
  { value: 'AcctNum', display_name: 'Account Number' },
  { value: 'Vendor1099', display_name: 'Vendor 1099' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Vendor ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  { value: 'GivenName', display_name: 'Given Name' },
  { value: 'FamilyName', display_name: 'Family Name' },
  { value: 'CompanyName', display_name: 'Company Name' },
  { value: 'DisplayName', display_name: 'Display Name' },
  { value: 'PrintOnCheckName', display_name: 'Print On Check Name' },
  { value: 'Active', display_name: 'Active Status' },
  { value: 'V4IDPseudonym', display_name: 'V4 ID Pseudonym' },
] satisfies IQoreAllowedValue<string>[];
