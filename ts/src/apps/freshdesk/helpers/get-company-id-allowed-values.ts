import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskCompany = {
  id: number;
  description: string;
  name: string;
};

const mapFreshdeskCompany = (company: TFreshdeskCompany): IQoreAllowedValue => ({
  value: company.id.toString(),
  display_name: company.name,
  desc: `ID: ${company.id}\n\nName: ${company.name}\n\nDescription: ${company.description}`,
});

export const getFreshdeskCompanyIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error('The token is required to get Freshdesk company allowed values');
  }

  if (!subdomain) {
    throw new Error('The subdomain option is required to get Freshdesk company allowed values');
  }

  const companies = await fetchFreshdeskAllowedValues<TFreshdeskCompany>({
    subdomain,
    token,
    path: '/api/v2/companies',
    mapItemToAllowedValue: mapFreshdeskCompany,
  });

  return companies;
};
