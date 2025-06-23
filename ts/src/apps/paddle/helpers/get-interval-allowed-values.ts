import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleIntervalAllowedValues = [
  { value: 'day', display_name: 'Day' },
  { value: 'week', display_name: 'Week' },
  { value: 'month', display_name: 'Month' },
  { value: 'year', display_name: 'Year' },
] satisfies IQoreAllowedValue<string>[];
