import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { fetchNetsuiteAllowedValues } from './constants';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';

type TNetsuiteSubsidiaryData = {
  id: string;
  isinactive: string;
  fullname: string;
  country: string;
};

type TNetsuiteSubsidiaryIdObject = {
  id: string;
};

type TNetsuiteSubsidiaryArray = {
  items: { id: string }[];
};

const getMapNetSuiteSubsidiary =
  <TValueType extends string | TNetsuiteSubsidiaryArray | TNetsuiteSubsidiaryIdObject>(
    type: 'string' | 'object' | 'array'
  ) =>
  (subsidiary: TNetsuiteSubsidiaryData): IQoreAllowedValue<TValueType> => {
    let value: TValueType;

    if (type === 'object') {
      value = { id: subsidiary.id } as TValueType;
    } else if (type === 'array') {
      value = { items: [{ id: subsidiary.id }] } as TValueType;
    } else {
      value = subsidiary.id as TValueType;
    }

    return {
      value,
      display_name: subsidiary.fullname,
      desc:
        `ID: ${subsidiary.id}\n\nName: ${subsidiary.fullname}\n\n` +
        `Country: ${subsidiary.country}`,
    };
  };

const createGetNetsuiteSubsidiaryAllowedValues = <
  TValueType extends string | TNetsuiteSubsidiaryArray | TNetsuiteSubsidiaryIdObject,
>(
  type: 'string' | 'object' | 'array'
): TQoreGetAllowedValuesFunction<typeof NETSUITE_CONN_OPTIONS, TValueType> => {
  return async (context): Promise<IQoreAllowedValue<TValueType>[]> => {
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
      mapItemToAllowedValue: getMapNetSuiteSubsidiary(type),
      query: `SELECT * FROM subsidiary WHERE isinactive='F'`,
    });

    return subsidiaries as IQoreAllowedValue<TValueType>[];
  };
};

export const getNetsuiteSubsidiaryIdAllowedValues =
  createGetNetsuiteSubsidiaryAllowedValues<string>('string');

export const getNetsuiteSubsidiaryObjectAllowedValues =
  createGetNetsuiteSubsidiaryAllowedValues<TNetsuiteSubsidiaryIdObject>('object');

export const getNetsuiteSubsidiaryIdArrayAllowedValues =
  createGetNetsuiteSubsidiaryAllowedValues<TNetsuiteSubsidiaryArray>('array');
