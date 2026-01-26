import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleProductOrderByFieldAllowedValues = [
  { value: 'createdAt', display_name: 'Created At' },
  { value: 'custom_data', display_name: 'Custom Data' },
  { value: 'description', display_name: 'Description' },
  { value: 'id', display_name: 'ID' },
  { value: 'imageUrl', display_name: 'Image URL' },
  { value: 'name', display_name: 'Name' },
  { value: 'status', display_name: 'Status' },
  { value: 'tax_category', display_name: 'Tax Category' },
  { value: 'type', display_name: 'Type' },
  { value: 'updatedAt', display_name: 'Updated At' },
] satisfies IQoreAllowedValue<string>[];
