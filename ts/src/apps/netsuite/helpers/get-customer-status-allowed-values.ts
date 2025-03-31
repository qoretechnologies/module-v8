import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues, TNetsuiteObjectAllowedValue } from './constants';

type TNetsuiteCustomerStatusData = {
  id: string;
  name: string;
  stage: string;
};

const fieldsToFetch = ['id', 'name', 'stage'];

const getMapNetsuiteCustomerStatus =
  <TValueType extends string | TNetsuiteObjectAllowedValue>(type: 'string' | 'object') =>
  (customerStatus: TNetsuiteCustomerStatusData): IQoreAllowedValue<TValueType> => ({
    value: (type === 'object' ? { id: customerStatus.id } : customerStatus.id) as TValueType,
    display_name: customerStatus.name,
    desc: `ID: ${customerStatus.id}\n\nName: ${customerStatus.name}\n\nStage: ${customerStatus.stage}`,
  });

const createGetNetsuiteCustomerStatusAllowedValues = <
  TValueType extends string | TNetsuiteObjectAllowedValue,
>(
  type: 'string' | 'object'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, TValueType> => {
  return async (context): Promise<IQoreAllowedValue<TValueType>[]> => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;

    if (!token || !account_id) {
      throw new Error(
        'The token and account_id are required to get NetSuite customer status allowed values'
      );
    }

    const customerStatuses = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: getMapNetsuiteCustomerStatus(type),
      query: `SELECT ${fieldsToFetch.join(',')} FROM customerstatus WHERE isinactive='F'`,
    });

    return customerStatuses as IQoreAllowedValue<TValueType>[];
  };
};

export const getNetsuiteCustomerStatusIdAllowedValues =
  createGetNetsuiteCustomerStatusAllowedValues<string>('string');

export const getNetsuiteCustomerStatusObjectAllowedValues =
  createGetNetsuiteCustomerStatusAllowedValues<TNetsuiteObjectAllowedValue>('object');
