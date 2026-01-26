import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteItemData = {
  id: string;
  itemtype: string;
  subtype: string;
  displayname: string;
};

type TNetsuiteItemAllowedValue = {
  item: { id: string };
};

type TNetsuiteItemArrayAllowedValue = {
  items: { item: { id: string } }[];
};

type TMapType = 'string' | 'object' | 'array';

const getMapNetSuiteItem =
  <T extends TNetsuiteItemAllowedValue | TNetsuiteItemArrayAllowedValue | string>(type: TMapType) =>
  (item: TNetsuiteItemData): IQoreAllowedValue<T> => {
    let value: T;

    if (type === 'array') {
      value = { items: [{ item: { id: item.id } }] } as T;
    } else if (type === 'object') {
      value = { item: { id: item.id } } as T;
    } else {
      value = item.id as T;
    }

    return {
      value,
      display_name: item.displayname || item.id,
      desc:
        `ID: ${item.id}\n\nName: ${item.displayname || item.id}\n\n` +
        `Type: ${item.itemtype}\n\n` +
        `Subtype: ${item.subtype}`,
    };
  };

const createNetsuiteItemIdAllowedValuesFunction = <
  T extends TNetsuiteItemAllowedValue | TNetsuiteItemArrayAllowedValue | string,
>(
  type: TMapType,
  itemSubtype?: 'Sale' | 'Purchase'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, T> => {
  return async (context): Promise<IQoreAllowedValue<T>[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error('The token and account_id are required to get NetSuite item allowed values');
    }

    const items = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: getMapNetSuiteItem<T>(type),
      query:
        `SELECT * FROM item WHERE item.isinactive='F' ` +
        `AND (item.subtype='${itemSubtype}' OR item.subtype='Both') ORDER BY item.lastmodifieddate DESC`,
    });

    return items as IQoreAllowedValue<T>[];
  };
};

export const getNetsuiteSalesItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  string
> = createNetsuiteItemIdAllowedValuesFunction<string>('string', 'Sale');

export const getNetsuiteSalesItemIdObjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemAllowedValue>('object', 'Sale');

export const getNetsuiteSalesItemIdArrayAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemArrayAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemArrayAllowedValue>('array', 'Sale');

export const getNetsuitePurchaseItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemAllowedValue>('string', 'Purchase');

export const getNetsuitePurchaseItemIdArrayAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemArrayAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemArrayAllowedValue>('array', 'Purchase');
