import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { fetchNetsuiteAllowedValues } from './constants';
import { NETSUITE_CONN_OPTIONS } from '../constants';

type TNetsuiteSubsidiaryData = {
  id: string;
  isinactive: string;
  fullname: string;
  country: string;
};

const mapNetSuiteSubsidiary = (subsidiary: TNetsuiteSubsidiaryData): IQoreAllowedValue => {
  return {
    value: { id: subsidiary.id },
    display_name: subsidiary.fullname,
    desc:
      `ID: ${subsidiary.id}\n\nName: ${subsidiary.fullname}\n\n` + `Country: ${subsidiary.country}`,
  };
};

const mapNetSuiteSubsidiaryArray = (subsidiary: TNetsuiteSubsidiaryData): IQoreAllowedValue => {
  return {
    value: { items: [{ id: subsidiary.id }] },
    display_name: subsidiary.fullname,
    desc:
      `ID: ${subsidiary.id}\n\nName: ${subsidiary.fullname}\n\n` + `Country: ${subsidiary.country}`,
  };
};

export const getNetsuiteSubsidiaryIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite subsidiary allowed values'
    );
  }

  const subsidiaries = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteSubsidiary,
    query: `SELECT * FROM subsidiary WHERE isinactive='F'`,
  });

  return subsidiaries;
};

export const getNetsuiteSubsidiaryIdArrayAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite subsidiary allowed values'
    );
  }

  const subsidiaries = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteSubsidiaryArray,
    query: `SELECT * FROM subsidiary WHERE isinactive='F'`,
  });

  return subsidiaries;
};
