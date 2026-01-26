import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { fetchNetsuiteAllowedValues } from './constants';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';

type TNetsuiteCurrencyData = {
  displaysymbol: string;
  exchangerate: string;
  id: string;
  isinactive: string;
  name: string;
  symbol: string;
};

type TNetsuiteCurrencyIdObject = {
  id: string;
};

const fieldsToFetch = ['displaysymbol', 'exchangerate', 'id', 'isinactive', 'name', 'symbol'];

const getMapNetSuiteCurrency =
  <ValueType extends TNetsuiteCurrencyIdObject | string>(type: 'object' | 'string') =>
  (currency: TNetsuiteCurrencyData): IQoreAllowedValue<ValueType> => ({
    value: (type === 'object' ? { id: currency.id } : currency.id) as ValueType,
    display_name: currency.name,
    desc:
      `ID: ${currency.id}\n\nName: ${currency.name}\n\nSymbol: ${currency.symbol}\n\n` +
      `Display Symbol: ${currency.displaysymbol}\n\n` +
      `Exchange Rate: ${currency.exchangerate}\n\nIs Inactive: ${currency.isinactive}`,
  });

const createGetNetsuiteCurrencyAllowedValues = <
  ValueType extends TNetsuiteCurrencyIdObject | string,
>(
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, ValueType> => {
  return async (context): Promise<IQoreAllowedValue<ValueType>[]> => {
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
      mapItemToAllowedValue: getMapNetSuiteCurrency(type),
      query: `SELECT ${fieldsToFetch.join(',')} FROM currency WHERE isinactive='F'`,
    });

    return currencies as IQoreAllowedValue<ValueType>[];
  };
};

export const getNetsuiteCurrencyObjectAllowedValues =
  createGetNetsuiteCurrencyAllowedValues<TNetsuiteCurrencyIdObject>('object');

export const getNetsuiteCurrencyIdAllowedValues =
  createGetNetsuiteCurrencyAllowedValues<string>('string');
