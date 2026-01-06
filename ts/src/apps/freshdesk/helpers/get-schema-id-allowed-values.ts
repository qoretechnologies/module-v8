import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_CONN_OPTIONS } from '../conn-options';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskSchema = {
  id: number;
  description: string;
  name: string;
};

const mapFreshdeskSchema = (schema: TFreshdeskSchema): IQoreAllowedValue => ({
  value: schema.id.toString(),
  display_name: schema.name,
  desc: `ID: ${schema.id}\n\nName: ${schema.name}\n\nDescription: ${schema.description}`,
});

export const getFreshdeskSchemaIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error('The token is required to get Freshdesk schema allowed values');
  }

  if (!subdomain) {
    throw new Error('The subdomain option is required to get Freshdesk schema allowed values');
  }

  const companies = await fetchFreshdeskAllowedValues<TFreshdeskSchema>({
    subdomain,
    token,
    path: '/api/v2/custom_objects/schemas',
    mapItemToAllowedValue: mapFreshdeskSchema,
  });

  return companies;
};
