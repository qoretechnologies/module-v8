/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTransactionStatusAllowedValues = [
  {
    value: 'draft',
    display_name: 'Draft',
    desc: 'Return transactions where the status is `draft`. Returned transactions are missing required fields.',
  },
  {
    value: 'ready',
    display_name: 'Ready',
    desc: 'Return transactions where the status is `ready`. Returned transactions have all of the required fields to be marked as `billed` or `completed`.',
  },
  {
    value: 'billed',
    display_name: 'Billed',
    desc: 'Return transactions where the status is `billed`. Returned transactions are considered legal records and cannot be changed.',
  },
  {
    value: 'paid',
    display_name: 'Paid',
    desc: 'Return transactions where the status is `paid`. Returned transactions are fully paid, but have not yet been fully processed internally.',
  },
  {
    value: 'completed',
    display_name: 'Completed',
    desc: 'Return transactions where the status is `completed`. Returned transactions are fully paid and processed.',
  },
  {
    value: 'canceled',
    display_name: 'Canceled',
    desc: 'Return transactions where the status is `canceled`. Returned transactions have been canceled and are no longer due.',
  },
  {
    value: 'past_due',
    display_name: 'Past Due',
    desc: 'Return transactions where the status is `past_due`. Returned transactions are past due, meaning payment failed for automatically-collected transactions or payment terms elapsed for manually-collected transactions.',
  },
] satisfies IQoreAllowedValue<string>[];
