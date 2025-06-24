import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const BusinessCentralFilterOperatorAllowedValues = [
  {
    value: 'eq',
    display_name: 'Equals',
  },
  {
    value: 'ne',
    display_name: 'Not Equals',
  },
  {
    value: 'gt',
    display_name: 'Greater Than',
  },
  {
    value: 'lt',
    display_name: 'Less Than',
  },
] satisfies IQoreAllowedValue<string>[];
