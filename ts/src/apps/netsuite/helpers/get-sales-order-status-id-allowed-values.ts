import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteSalesOrderStatusData = {
  id: string;
  name: string;
  fullname: string;
};

const mapNetSuiteSalesOrderStatus = (status: TNetsuiteSalesOrderStatusData): IQoreAllowedValue => ({
  value: status.id,
  display_name: status.name,
  short_desc: status.fullname,
});

const mapNetSuiteSalesOrderStatusObject = (
  status: TNetsuiteSalesOrderStatusData
): IQoreAllowedValue => ({
  value: { id: status.id },
  display_name: status.name,
  short_desc: status.fullname,
});

const createGetNetsuiteSalesOrderStatusIdAllowedValuesFunction = (
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS> => {
  return async (context): Promise<IQoreAllowedValue[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error(
        'The token and account_id are required to get NetSuite sales order status allowed values'
      );
    }

    const orderStatuses = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue:
        type === 'string' ? mapNetSuiteSalesOrderStatus : mapNetSuiteSalesOrderStatusObject,
      query: `SELECT * FROM transactionStatus`,
    });

    return orderStatuses;
  };
};

export const getNetsuiteSalesOrderStatusIdAllowedValues =
  createGetNetsuiteSalesOrderStatusIdAllowedValuesFunction('string');

export const getNetsuiteSalesOrderStatusObjectAllowedValues =
  createGetNetsuiteSalesOrderStatusIdAllowedValuesFunction('object');
