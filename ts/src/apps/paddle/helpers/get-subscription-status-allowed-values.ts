import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleSubscriptionStatusAllowedValues = [
  { value: 'active', display_name: 'Active' },
  { value: 'canceled', display_name: 'Canceled' },
  { value: 'past_due', display_name: 'Past Due' },
  { value: 'paused', display_name: 'Paused' },
  { value: 'trialing', display_name: 'Trialing' },
] satisfies IQoreAllowedValue<string>[];
