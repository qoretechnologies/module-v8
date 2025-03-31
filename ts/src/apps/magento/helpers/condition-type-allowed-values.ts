import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const MagentoConditionTypeAllowedValues: IQoreAllowedValue<string>[] = [
  { value: 'eq', display_name: 'Equals (exact match)' },
  { value: 'neq', display_name: 'Not equals' },
  { value: 'gt', display_name: 'Greater than' },
  { value: 'lt', display_name: 'Less than' },
  { value: 'gteq', display_name: 'Greater than or equal to' },
  { value: 'lteq', display_name: 'Less than or equal to' },
  { value: 'like', display_name: 'Partial match (supports wildcards like %)' },
  { value: 'in', display_name: 'Value is in a list of values' },
  { value: 'nin', display_name: 'Value is not in a list of values' },
  { value: 'notnull', display_name: 'Value is not null' },
  { value: 'null', display_name: 'Value is null' },
];
