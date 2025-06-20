/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTransactionIncludeAllowedValues = [
  {
    value: 'address',
    display_name: 'Address',
    desc: 'Include an object for the address entity related to this transaction. Only included where an `address_id` is set against the transaction. Permission required.',
  },
  {
    value: 'adjustments',
    display_name: 'Adjustments',
    desc: 'Include an array of adjustments related to this transaction. Only included where a transaction has adjustments. Permission required.',
  },
  {
    value: 'adjustments_totals',
    display_name: 'Adjustments Totals',
    desc: 'Include an object that includes totals for all adjustments against this transaction.',
  },
  {
    value: 'available_payment_methods',
    display_name: 'Available Payment Methods',
    desc: 'Include an array of available payment methods for this transaction.',
  },
  {
    value: 'business',
    display_name: 'Business',
    desc: 'Include an object for the business entity related to this transaction. Only included where a `business_id` is set against the transaction. Permission required.',
  },
  {
    value: 'customer',
    display_name: 'Customer',
    desc: 'Include an object for the customer entity related to this transaction. Only included where a `customer_id` is set against the transaction. Permission required.',
  },
  {
    value: 'discount',
    display_name: 'Discount',
    desc: 'Include an object for the discount entity related to this transaction. Only included where a `discount_id` is set against the transaction. Permission required.',
  },
] satisfies IQoreAllowedValue<string>[];
