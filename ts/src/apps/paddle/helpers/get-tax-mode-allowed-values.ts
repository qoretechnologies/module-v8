import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTaxModeAllowedValues = [
  {
    value: 'account_setting',
    display_name: 'Account Setting',
    desc: 'Prices use the setting from your account.',
  },
  {
    value: 'external',
    display_name: 'External (Tax Exclusive)',
    desc: 'Prices are exclusive of tax.',
  },
  {
    value: 'internal',
    display_name: 'Internal (Tax Inclusive)',
    desc: 'Prices are inclusive of tax.',
  },
  {
    value: 'location',
    display_name: 'Location Based',
    desc: 'Tax calculation based on location.',
  },
] satisfies IQoreAllowedValue<string>[];
