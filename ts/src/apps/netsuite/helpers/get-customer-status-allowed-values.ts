import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteCustomerStatusData = {
  id: string;
  name: string;
  stage: string;
};

const fieldsToFetch = ['id', 'name', 'stage'];

const mapNetsuiteCustomerStatus = (
  customerStatus: TNetsuiteCustomerStatusData
): IQoreAllowedValue => ({
  value: { id: customerStatus.id },
  display_name: customerStatus.name,
  desc: `ID: ${customerStatus.id}\n\nName: ${customerStatus.name}\n\nStage: ${customerStatus.stage}`,
});

export const getNetsuiteCustomerStatusIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
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
    mapItemToAllowedValue: mapNetsuiteCustomerStatus,
    query: `SELECT ${fieldsToFetch.join(',')} FROM customerstatus WHERE isinactive='F'`,
  });

  return customerStatuses;
};
