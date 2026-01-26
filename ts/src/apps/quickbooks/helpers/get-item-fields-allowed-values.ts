import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksItemFieldsAllowedValues = [
  { value: 'Name', display_name: 'Item Name' },
  { value: 'Active', display_name: 'Active Status' },
  { value: 'FullyQualifiedName', display_name: 'Fully Qualified Name' },
  { value: 'Taxable', display_name: 'Taxable' },
  { value: 'UnitPrice', display_name: 'Unit Price' },
  { value: 'Type', display_name: 'Item Type' },
  { value: 'PurchaseCost', display_name: 'Purchase Cost' },
  { value: 'TrackQtyOnHand', display_name: 'Track Quantity On Hand' },
  { value: 'domain', display_name: 'Domain' },
  { value: 'sparse', display_name: 'Sparse' },
  { value: 'Id', display_name: 'Item ID' },
  { value: 'SyncToken', display_name: 'Sync Token' },
  { value: 'MetaData.CreateTime', display_name: 'Create Time' },
  { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
] satisfies IQoreAllowedValue<string>[];
