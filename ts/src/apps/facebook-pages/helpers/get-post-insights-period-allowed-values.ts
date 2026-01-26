import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const FacebookPostInsightsPeriodAllowedValues = [
  {
    value: 'day',
    display_name: 'Day',
    desc: 'Daily breakdown of metrics',
  },
  {
    value: 'week',
    display_name: 'Week',
    desc: 'Weekly breakdown of metrics',
  },
  {
    value: 'days_28',
    display_name: '28 Days',
    desc: '28-day breakdown of metrics',
  },
  {
    value: 'lifetime',
    display_name: 'Lifetime',
    desc: 'Lifetime total metrics',
  },
] satisfies IQoreAllowedValue<string>[];
