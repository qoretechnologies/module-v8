/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTransactionOriginAllowedValues = [
  {
    value: 'api',
    display_name: 'API',
    desc: 'Return transactions where the origin is `api`. Returned transactions were created by the Paddle API.',
  },
  {
    value: 'subscription_charge',
    display_name: 'Subscription Charge',
    desc: 'Return transactions where the origin is `subscription_charge`. Returned transactions were created automatically by Paddle as a result of a one-time charge for a subscription.',
  },
  {
    value: 'subscription_payment_method_change',
    display_name: 'Subscription Payment Method Change',
    desc: 'Return transactions where the origin is `subscription_payment_method_change`. Returned transactions were created automatically as part of updating a payment method. May be a zero value transaction.',
  },
  {
    value: 'subscription_recurring',
    display_name: 'Subscription Recurring',
    desc: 'Return transactions where the origin is `subscription_recurring`. Returned transactions were created automatically by Paddle as a result of a subscription renewal.',
  },
  {
    value: 'subscription_update',
    display_name: 'Subscription Update',
    desc: 'Return transactions where the origin is `subscription_update`. Returned transactions were created automatically by Paddle as a result of an update to a subscription.',
  },
  {
    value: 'web',
    display_name: 'Web',
    desc: 'Return transactions where the origin is `web`. Returned transactions were created automatically by Paddle.js for a checkout.',
  },
] satisfies IQoreAllowedValue<string>[];
