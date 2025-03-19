import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
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

const mapNetSuiteItem = (item: TNetsuiteItemData): IQoreAllowedValue => {
  return {
    value: { item: { id: item.id } },
    display_name: item.displayname || item.id,
    desc:
      `ID: ${item.id}\n\nName: ${item.displayname || item.id}\n\n` +
      `Type: ${item.itemtype}\n\n` +
      `Subtype: ${item.subtype}`,
  };
};

const mapNetSuiteItemArray = (item: TNetsuiteItemData): IQoreAllowedValue => {
  return {
    value: { items: [{ item: { id: item.id } }] },
    display_name: item.displayname || item.id,
    desc:
      `ID: ${item.id}\n\nName: ${item.displayname || item.id}\n\n` +
      `Type: ${item.itemtype}\n\n` +
      `Subtype: ${item.subtype}`,
  };
};

const createNetsuiteItemIdAllowedValuesFunction = <
  T extends TNetsuiteItemAllowedValue | TNetsuiteItemArrayAllowedValue,
>(
  type: 'item' | 'array'
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
      mapItemToAllowedValue: type === 'item' ? mapNetSuiteItem : mapNetSuiteItemArray,
      query:
        `SELECT * FROM item WHERE item.isinactive='F' ` +
        `AND (item.subtype='Sale' OR item.subtype='Both') ORDER BY item.lastmodifieddate DESC`,
    });

    return items as IQoreAllowedValue<T>[];
  };
};

export const getNetsuiteItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemAllowedValue>('item');

export const getNetsuiteItemIdArrayAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  TNetsuiteItemArrayAllowedValue
> = createNetsuiteItemIdAllowedValuesFunction<TNetsuiteItemArrayAllowedValue>('array');
