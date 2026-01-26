import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const QuickBooksOperatorsAllowedValues = [
  {
    value: '=',
    display_name: 'Equals',
    desc: 'Exact match (default operator if not specified)',
  },
  {
    value: '>',
    display_name: 'Greater Than',
    desc: 'Greater than comparison for numbers and dates',
  },
  {
    value: '<',
    display_name: 'Less Than',
    desc: 'Less than comparison for numbers and dates',
  },
  {
    value: '>=',
    display_name: 'Greater Than or Equal',
    desc: 'Greater than or equal comparison for numbers and dates',
  },
  {
    value: '<=',
    display_name: 'Less Than or Equal',
    desc: 'Less than or equal comparison for numbers and dates',
  },
  {
    value: 'LIKE',
    display_name: 'Like (Pattern Match)',
    desc: 'Pattern matching with wildcards (% for multiple chars, _ for single char)',
  },
  {
    value: 'IN',
    display_name: 'In List',
    desc: 'Match against multiple comma-separated values',
  },
] satisfies IQoreAllowedValue<string>[];
