import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddlePricesOrderByFieldsAllowedValues = [
  {
    value: 'billing_cycle.frequency',
    display_name: 'Billing Cycle Frequency',
  },
  {
    value: 'billing_cycle.interval',
    display_name: 'Billing Cycle Interval',
  },
  {
    value: 'id',
    display_name: 'ID',
  },
  {
    value: 'product_id',
    display_name: 'Product ID',
  },
  {
    value: 'quantity.maximum',
    display_name: 'Quantity Maximum',
  },
  {
    value: 'quantity.minimum',
    display_name: 'Quantity Minimum',
  },
  {
    value: 'status',
    display_name: 'Status',
  },
  {
    value: 'tax_mode',
    display_name: 'Tax Mode',
  },
  {
    value: 'unit_price.amount',
    display_name: 'Unit Price Amount',
  },
  {
    value: 'unit_price.currency_code',
    display_name: 'Unit Price Currency Code',
  },
] satisfies IQoreAllowedValue<string>[];
