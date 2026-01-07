import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { fetchSuiteQlData } from './constants';
import { normalizeName } from '../../../global/helpers';

const mapFieldToAllowedValue = (field: string): IQoreAllowedValue<string> => ({
  value: field,
  display_name: normalizeName(field),
  short_desc: field,
});

const mapFieldToAllowedValueObject = (field: string): IQoreAllowedValue<object> => ({
  value: { key: field, value: '' },
  display_name: normalizeName(field),
  short_desc: field,
});

export const createGetNetsuiteQueryFieldAllowedValuesFunction = <T extends 'string' | 'object'>(
  type: T
): TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  T extends 'string' ? string : object
> => {
  return async (context): Promise<IQoreAllowedValue<T extends 'string' ? string : object>[]> => {
    const token = context?.conn_opts?.token;
    const accountId = context?.conn_opts?.account_id;
    const recordType = context?.opts?.recordType;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!accountId) missingValues.push('account_id');
    if (!recordType) missingValues.push('recordType');

    if (missingValues.length) {
      throw new Error(
        `The following values are required to get NetSuite query field allowed values: ${missingValues.join(
          ', '
        )}`
      );
    }

    try {
      const data = await fetchSuiteQlData({
        accountId: accountId!,
        token: token!,
        q: `SELECT * FROM ${recordType}`,
        limit: 1,
      });

      const items = data.items;
      if (!items.length) {
        throw new Error(`No items found for record type ${recordType}`);
      }

      const record = items[0] as Record<string, any>;
      const fields = Object.keys(record);

      if (type === 'string') {
        return fields.map(mapFieldToAllowedValue) as IQoreAllowedValue<
          T extends 'string' ? string : object
        >[];
      } else {
        return fields.map(mapFieldToAllowedValueObject) as IQoreAllowedValue<
          T extends 'string' ? string : object
        >[];
      }
    } catch (error) {
      throw new Error(`Error fetching Netsuite query field allowed values: ${error}`);
    }
  };
};

export const getNetsuiteQueryFieldAllowedValues =
  createGetNetsuiteQueryFieldAllowedValuesFunction('string');

export const getNetsuiteQueryFieldAllowedValuesObject =
  createGetNetsuiteQueryFieldAllowedValuesFunction('object');
