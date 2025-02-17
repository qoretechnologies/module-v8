import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotCompany = {
  id: string;
  properties: {
    createdate: string;
    domain: string;
    hs_lastmodifieddate: string;
    hs_object_id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotCompany = (company: THubspotCompany): IQoreAllowedValue<string> => ({
  value: company.id,
  display_name: company.properties.name,
  short_desc:
    `Domain: ${company.properties.domain}\n\n Archived: ${company.archived}\n\n` +
    `Created at: ${company.createdAt}\n\nUpdated at: ${company.updatedAt}`,
});

export const getHubspotCompanyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot company allowed values');
  }

  const companies = await fetchHubspotAllowedValues<THubspotCompany>({
    token,
    object: 'companies',
    mapItemToAllowedValue: mapHubspotCompany,
  });

  return companies;
};
