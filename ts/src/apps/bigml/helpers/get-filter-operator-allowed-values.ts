import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BigMlFilterOperatorAllowedValues = [
  { value: '!', display_name: 'Not equal to' },
  { value: '__gt', display_name: 'Greater than' },
  { value: '__gte', display_name: 'Greater than or equal to' },
  { value: '__contains', display_name: 'Contains (Case sensitive)' },
  { value: '__icontains', display_name: 'Contains (Case insensitive)' },
  { value: '__startswith', display_name: 'Starts With (Case sensitive)' },
  { value: '__istartswith', display_name: 'Starts With (Case insensitive)' },
  { value: '__in', display_name: 'In (Case insensitive)' },
  { value: '__lt', display_name: 'Less than' },
  { value: '__lte', display_name: 'Less than or equal to' },
] satisfies IQoreAllowedValue<string>[];
