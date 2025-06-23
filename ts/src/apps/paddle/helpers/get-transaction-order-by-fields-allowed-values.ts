import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTransactionOrderByFieldsAllowedValues = [
  { value: 'updated_at', display_name: 'Updated At' },
  { value: 'billed_at', display_name: 'Billed At' },
  { value: 'created_at', display_name: 'Created At' },
  { value: 'id', display_name: 'ID' },
] satisfies IQoreAllowedValue<string>[];
