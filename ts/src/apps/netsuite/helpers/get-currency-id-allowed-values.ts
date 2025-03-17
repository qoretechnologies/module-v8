import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { fetchNetsuiteAllowedValues } from './constants';
import { NETSUITE_CONN_OPTIONS } from '../constants';

type TNetsuiteCurrencyData = {
  displaysymbol: string;
  exchangerate: string;
  id: string;
  isinactive: string;
  name: string;
  symbol: string;
};

const fieldsToFetch = ['displaysymbol', 'exchangerate', 'id', 'isinactive', 'name', 'symbol'];

const mapNetSuiteCurrency = (currency: TNetsuiteCurrencyData): IQoreAllowedValue => ({
  value: { id: currency.id },
  display_name: currency.name,
  desc:
    `ID: ${currency.id}\n\nName: ${currency.name}\n\nSymbol: ${currency.symbol}\n\n` +
    `Display Symbol: ${currency.displaysymbol}\n\n` +
    `Exchange Rate: ${currency.exchangerate}\n\nIs Inactive: ${currency.isinactive}`,
});

export const getNetsuiteCurrencyIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite currency allowed values'
    );
  }

  const currencies = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteCurrency,
    query: `SELECT ${fieldsToFetch.join(',')} FROM currency WHERE isinactive='F'`,
  });

  return currencies;
};
