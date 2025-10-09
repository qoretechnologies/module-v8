import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const SupabaseFilterOperatorAllowedValues = [
  { value: 'eq', display_name: 'Equals (=)' },
  { value: 'neq', display_name: 'Not equals (!=)' },
  { value: 'gt', display_name: 'Greater than (>)' },
  { value: 'gte', display_name: 'Greater than or equal (>=)' },
  { value: 'lt', display_name: 'Less than (<)' },
  { value: 'lte', display_name: 'Less than or equal (<=)' },
  { value: 'like', display_name: 'Pattern match (LIKE)' },
  { value: 'ilike', display_name: 'Case-insensitive pattern match (ILIKE)' },
  { value: 'is', display_name: 'Is (IS)' },
  { value: 'in', display_name: 'In list (IN)' },
  { value: 'contains', display_name: 'Contains' },
  { value: 'containedBy', display_name: 'Contained by' },
] satisfies IQoreAllowedValue<string>[];
