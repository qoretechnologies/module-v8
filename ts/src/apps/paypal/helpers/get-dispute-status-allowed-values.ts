import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PayPalDisputeStatusAllowedValues = [
  {
    value: 'OPEN_INQUIRIES',
    display_name: 'Open Inquiries',
    desc: 'The dispute is in the inquiry phase where the customer and merchant can communicate to resolve the issue.',
  },
  {
    value: 'REQUIRED_ACTION',
    display_name: 'Required Action',
    desc: 'Action is required from the merchant to respond to or resolve the dispute.',
  },
  {
    value: 'REQUIRED_OTHER_PARTY_ACTION',
    display_name: 'Required Other Party Action',
    desc: 'Action is required from the other party (customer) to proceed with the dispute.',
  },
  {
    value: 'UNDER_PAYPAL_REVIEW',
    display_name: 'Under PayPal Review',
    desc: 'The dispute is being reviewed by PayPal for a decision.',
  },
  {
    value: 'APPEALABLE',
    display_name: 'Appealable',
    desc: 'The dispute decision can be appealed by either party.',
  },
  {
    value: 'RESOLVED',
    display_name: 'Resolved',
    desc: 'The dispute has been resolved and closed.',
  },
] satisfies IQoreAllowedValue<string>[];
