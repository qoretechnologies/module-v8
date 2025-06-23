import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleCustomerOrderByFieldsAllowedValues = [
  { value: 'created_at', display_name: 'Created At' },
  { value: 'id', display_name: 'ID' },
] satisfies IQoreAllowedValue<string>[];
