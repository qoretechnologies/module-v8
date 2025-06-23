import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTypeAllowedValues = [
  {
    value: 'custom',
    display_name: 'Custom',
  },
  {
    value: 'standard',
    display_name: 'Standard',
  },
] satisfies IQoreAllowedValue<string>[];
