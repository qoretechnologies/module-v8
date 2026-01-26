import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleStatusAllowedValues = [
  {
    value: 'active',
    display_name: 'Active',
  },
  {
    value: 'archived',
    display_name: 'Archived',
  },
] satisfies IQoreAllowedValue<string>[];
