import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { executeShopifyGraphQL, ShopifyError } from './constants';

export const getShopifyCurrencyAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  try {
    const query = `
      query {
        shop {
          currencyCode
          currencySettings(first: 50) {
            edges {
              node {
                currencyCode
                currencyName
                enabled
              }
            }
          }
        }
      }
    `;

    const response = await executeShopifyGraphQL(context, query);

    const shopCurrency = response.data?.shop?.currencyCode;

    const currencyInfoMap = new Map();

    if (shopCurrency) {
      currencyInfoMap.set(shopCurrency, {
        code: shopCurrency,
        name: getCurrencyName(shopCurrency),
        symbol: getCurrencySymbol(shopCurrency),
        enabled: true,
      });
    }

    const currencySettings = response.data?.shop?.currencySettings?.edges || [];
    if (currencySettings.length > 0) {
      currencySettings.forEach((edge: { node: any }) => {
        const curr = edge.node;
        if (curr.currencyCode) {
          currencyInfoMap.set(curr.currencyCode, {
            code: curr.currencyCode,
            name: curr.currencyName || getCurrencyName(curr.currencyCode),
            symbol: getCurrencySymbol(curr.currencyCode),
            enabled: curr.enabled,
          });
        }
      });
    }

    if (currencyInfoMap.size === 0) {
      getCommonCurrencies().forEach((curr) => {
        currencyInfoMap.set(curr.code, curr);
      });
    } else {
      getCommonCurrencies().forEach((curr) => {
        if (!currencyInfoMap.has(curr.code)) {
          currencyInfoMap.set(curr.code, {
            ...curr,
            enabled: false,
          });
        }
      });
    }

    const currenciesList = Array.from(currencyInfoMap.values());

    const sortedCurrencies = [...currenciesList].sort((a, b) => {
      if (a.enabled !== b.enabled) {
        return a.enabled ? -1 : 1;
      }

      if (a.enabled && b.enabled) {
        if (a.code === shopCurrency) return -1;
        if (b.code === shopCurrency) return 1;
      }

      return a.name.localeCompare(b.name);
    });

    return sortedCurrencies.map((currency) => ({
      display_name: `${currency.code} - ${currency.name} (${currency.symbol})`,
      value: currency.code,
      short_desc:
        `ISO Currency Code: ${currency.code}\n\n` +
        `Name: ${currency.name}\n\n` +
        `Symbol: ${currency.symbol}${currency.enabled === false ? '\n\nNOTE: Not enabled in shop' : ''}`,
      ...(currency.code === shopCurrency ? { preselected: true } : {}),
    }));
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(`Failed to fetch currency information: ${error.message}`, error);
  }
};

function getCommonCurrencies() {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$', enabled: false },
    { code: 'EUR', name: 'Euro', symbol: '€', enabled: false },
    { code: 'GBP', name: 'British Pound', symbol: '£', enabled: false },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', enabled: false },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', enabled: false },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', enabled: false },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', enabled: false },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', enabled: false },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', enabled: false },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', enabled: false },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', enabled: false },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', enabled: false },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', enabled: false },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', enabled: false },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', enabled: false },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', enabled: false },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', enabled: false },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', enabled: false },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', enabled: false },
  ];
}

function getCurrencyName(code: string): string {
  const names: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    JPY: 'Japanese Yen',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    BRL: 'Brazilian Real',
    MXN: 'Mexican Peso',
    SGD: 'Singapore Dollar',
    CHF: 'Swiss Franc',
    NZD: 'New Zealand Dollar',
    SEK: 'Swedish Krona',
    NOK: 'Norwegian Krone',
    DKK: 'Danish Krone',
    HKD: 'Hong Kong Dollar',
    PLN: 'Polish Złoty',
    RUB: 'Russian Ruble',
  };

  return names[code] || code;
}

function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: 'MX$',
    SGD: 'S$',
    CHF: 'CHF',
    NZD: 'NZ$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    HKD: 'HK$',
    PLN: 'zł',
    RUB: '₽',
  };

  return symbols[code] || code;
}
