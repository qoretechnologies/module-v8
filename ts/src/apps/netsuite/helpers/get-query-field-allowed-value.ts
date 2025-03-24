import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchSuiteQlData } from './constants';
import { normalizeName } from '../../../global/helpers';

export const getNetsuiteQueryFieldAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
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

    const allowedValues: IQoreAllowedValue<string>[] = fields.map((field) => ({
      value: field,
      display_name: normalizeName(field),
      short_desc: field,
    }));

    return allowedValues;
  } catch (error) {
    throw new Error(`Error fetching Netsuite query field allowed values: ${error}`);
  }
};
