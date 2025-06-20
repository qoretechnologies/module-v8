/* eslint-disable max-len */
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const PaddleReportTypeAllowedValues = [
  {
    value: 'balance',
    display_name: 'Balance',
    desc: 'Balance reports contain information about your account balance activity, including all movements of funds in and out of your balance.',
  },
  {
    value: 'discounts',
    display_name: 'Discounts',
    desc: 'Discounts reports contain information about your product and checkout discounts.',
  },
  {
    value: 'products_prices',
    display_name: 'Products & Prices',
    desc: 'Products and prices reports contain information about your products and prices. May include non-catalog products and prices.',
  },
  {
    value: 'transactions',
    display_name: 'Transactions',
    desc: 'Transactions reports contain information about revenue received, past due invoices, draft and issued invoices, and canceled transactions.',
  },
  {
    value: 'transaction_line_items',
    display_name: 'Transaction Line Items',
    desc: 'Transactions reports contain information about revenue received, past due invoices, draft and issued invoices, and canceled transactions. The report is broken down by line item level.',
  },
  {
    value: 'adjustments',
    display_name: 'Adjustments',
    desc: 'Adjustments reports contain information about refunds, credits, and chargebacks.',
  },
  {
    value: 'adjustment_line_items',
    display_name: 'Adjustment Line Items',
    desc: 'Adjustments reports contain information about refunds, credits, and chargebacks. The report is broken down by line item level.',
  },
] satisfies IQoreAllowedValue<string>[];

export const PaddleBalanceReportFilterAllowedValues = [
  {
    value: 'updated_at',
    display_name: 'Updated At',
    desc: 'Filter by discount updated date. Pass an RFC 3339 datetime string.',
  },
] satisfies IQoreAllowedValue<string>[];

export const PaddleDiscountsReportFilterAllowedValues = [
  {
    value: 'type',
    display_name: 'Type',
    desc: 'Filter by discount type. Pass an array of strings containing any valid value for the `type` field against a discount.',
  },
  {
    value: 'status',
    display_name: 'Status',
    desc: 'Filter by discount status. Pass an array of strings containing any valid value for the `status` field against a discount.',
  },
  {
    value: 'updated_at',
    display_name: 'Updated At',
    desc: 'Filter by discount updated date. Pass an RFC 3339 datetime string.',
  },
] satisfies IQoreAllowedValue<string>[];

export const PaddleProductsPricesReportFilterAllowedValues = [
  {
    value: 'product_status',
    display_name: 'Product Status',
    desc: 'Filter by product status. Pass an array of strings containing any valid value for the `status` field against a product.',
  },
  {
    value: 'price_status',
    display_name: 'Price Status',
    desc: 'Filter by price status. Pass an array of strings containing any valid value for the `status` field against a price.',
  },
  {
    value: 'product_type',
    display_name: 'Product Type',
    desc: 'Filter by product type. Pass an array of strings containing any valid value for the `type` field against a product.',
  },
  {
    value: 'price_type',
    display_name: 'Price Type',
    desc: 'Filter by price type. Pass an array of strings containing any valid value for the `type` field against a price.',
  },
  {
    value: 'product_updated_at',
    display_name: 'Product Updated At',
    desc: 'Filter by product `updated_at` date. Pass an RFC 3339 datetime string.',
  },
  {
    value: 'price_updated_at',
    display_name: 'Price Updated At',
    desc: 'Filter by price `updated_at` date. Pass an RFC 3339 datetime string.',
  },
] satisfies IQoreAllowedValue<string>[];

export const PaddleTransactionsReportFilterAllowedValues = [
  {
    value: 'collection_mode',
    display_name: 'Collection Mode',
    desc: 'Filter by collection mode. Pass an array of strings containing any valid value for the `collection_mode` field against a transaction.',
  },
  {
    value: 'currency_code',
    display_name: 'Currency Code',
    desc: 'Filter by transaction or adjustment currency. Pass an array of strings containing any valid supported three-letter ISO 4217 currency code.',
  },
  {
    value: 'origin',
    display_name: 'Origin',
    desc: 'Filter by transaction origin. Pass an array of strings containing any valid value for the origin field against a transaction.',
  },
  {
    value: 'status',
    display_name: 'Status',
    desc: 'Filter by transaction or adjustment status. Pass an array of strings containing any valid value for the `status` field against a transaction or an adjustment.',
  },
  {
    value: 'updated_at',
    display_name: 'Updated At',
    desc: 'Filter by transaction or adjustment updated date. Pass an RFC 3339 datetime string.',
  },
] satisfies IQoreAllowedValue<string>[];

export const PaddleAdjustmentsReportFilterAllowedValues = [
  {
    value: 'action',
    display_name: 'Action',
    desc: 'Filter by adjustment action. Pass an array of strings containing any valid value for the `action` field against an adjustment.',
  },
  {
    value: 'currency_code',
    display_name: 'Currency Code',
    desc: 'Filter by transaction or adjustment currency. Pass an array of strings containing any valid supported three-letter ISO 4217 currency code.',
  },
  {
    value: 'status',
    display_name: 'Status',
    desc: 'Filter by transaction or adjustment status. Pass an array of strings containing any valid value for the `status` field against a transaction or an adjustment.',
  },
  {
    value: 'updated_at',
    display_name: 'Updated At',
    desc: 'Filter by transaction or adjustment updated date. Pass an RFC 3339 datetime string.',
  },
] satisfies IQoreAllowedValue<string>[];

export const getPaddleReportFilterAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = (context) => {
  const type = context?.opts?.type;

  if (!type) {
    return [];
  }

  switch (type) {
    case 'balance':
      return PaddleBalanceReportFilterAllowedValues;
    case 'discounts':
      return PaddleDiscountsReportFilterAllowedValues;
    case 'products':
      return PaddleProductsPricesReportFilterAllowedValues;
    case 'transactions':
      return PaddleTransactionsReportFilterAllowedValues;
    case 'adjustments':
      return PaddleAdjustmentsReportFilterAllowedValues;
    default:
      return [];
  }
};
