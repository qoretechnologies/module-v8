import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PayPalCurrencyCodesAllowedValues = [
  { value: 'AUD', display_name: 'Australian Dollar (AUD)', desc: 'Australian dollar' },
  {
    value: 'BRL',
    display_name: 'Brazilian Real (BRL)',
    desc: 'Brazilian real - supported as payment currency and currency balance for in-country PayPal accounts only',
  },
  { value: 'CAD', display_name: 'Canadian Dollar (CAD)', desc: 'Canadian dollar' },
  {
    value: 'CNY',
    display_name: 'Chinese Renminbi (CNY)',
    desc: 'Chinese Renminbi - supported as payment currency and currency balance for in-country PayPal accounts only',
  },
  { value: 'CZK', display_name: 'Czech Koruna (CZK)', desc: 'Czech koruna' },
  { value: 'DKK', display_name: 'Danish Krone (DKK)', desc: 'Danish krone' },
  { value: 'EUR', display_name: 'Euro (EUR)', desc: 'Euro' },
  { value: 'HKD', display_name: 'Hong Kong Dollar (HKD)', desc: 'Hong Kong dollar' },
  {
    value: 'HUF',
    display_name: 'Hungarian Forint (HUF)',
    desc: 'Hungarian forint - does not support decimals',
  },
  { value: 'ILS', display_name: 'Israeli New Shekel (ILS)', desc: 'Israeli new shekel' },
  {
    value: 'JPY',
    display_name: 'Japanese Yen (JPY)',
    desc: 'Japanese yen - does not support decimals',
  },
  {
    value: 'MYR',
    display_name: 'Malaysian Ringgit (MYR)',
    desc: 'Malaysian ringgit - supported as payment currency and currency balance for in-country PayPal accounts only',
  },
  { value: 'MXN', display_name: 'Mexican Peso (MXN)', desc: 'Mexican peso' },
  {
    value: 'TWD',
    display_name: 'New Taiwan Dollar (TWD)',
    desc: 'New Taiwan dollar - does not support decimals',
  },
  { value: 'NZD', display_name: 'New Zealand Dollar (NZD)', desc: 'New Zealand dollar' },
  { value: 'NOK', display_name: 'Norwegian Krone (NOK)', desc: 'Norwegian krone' },
  { value: 'PHP', display_name: 'Philippine Peso (PHP)', desc: 'Philippine peso' },
  { value: 'PLN', display_name: 'Polish Złoty (PLN)', desc: 'Polish złoty' },
  { value: 'GBP', display_name: 'Pound Sterling (GBP)', desc: 'Pound sterling' },
  { value: 'RUB', display_name: 'Russian Ruble (RUB)', desc: 'Russian ruble' },
  { value: 'SGD', display_name: 'Singapore Dollar (SGD)', desc: 'Singapore dollar' },
  { value: 'SEK', display_name: 'Swedish Krona (SEK)', desc: 'Swedish krona' },
  { value: 'CHF', display_name: 'Swiss Franc (CHF)', desc: 'Swiss franc' },
  { value: 'THB', display_name: 'Thai Baht (THB)', desc: 'Thai baht' },
  { value: 'USD', display_name: 'United States Dollar (USD)', desc: 'United States dollar' },
] satisfies IQoreAllowedValue<string>[];
