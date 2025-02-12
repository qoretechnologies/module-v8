import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotLead = {
  id: string;
  properties: {
    email: string;
    phone: string;
    company: string;
    lead_status: string;
    source: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotLead = (lead: THubspotLead): IQoreAllowedValue<string> => ({
  value: lead.id,
  display_name: lead.properties.email || lead.id,
  short_desc:
    `Phone: ${lead.properties.phone}\n\nCompany: ${lead.properties.company}\n\n` +
    `Lead status: ${lead.properties.lead_status}\n\nSource: ${lead.properties.source}\n\n` +
    `Archived: ${lead.archived}\n\nCreated at: ${lead.createdAt}\n\nUpdated at: ${lead.updatedAt}`,
});

export const getHubspotLeadAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot lead allowed values');
  }

  const leads = await fetchHubspotAllowedValues<THubspotLead>({
    token,
    object: 'leads',
    mapItemToAllowedValue: mapHubspotLead,
  });

  return leads;
};
