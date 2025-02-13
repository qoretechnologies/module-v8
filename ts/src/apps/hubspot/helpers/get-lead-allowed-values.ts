import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotLead = {
  id: string;
  properties: {
    hs_lead_label: string;
    hs_lead_name: string;
    hs_lead_type: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotLead = (lead: THubspotLead): IQoreAllowedValue<string> => ({
  value: lead.id,
  display_name: lead.properties.hs_lead_name || lead.id,
  short_desc:
    `Label: ${lead.properties.hs_lead_label}\n\n Type:${lead.properties.hs_lead_type}\n\n` +
    `Created at: ${lead.createdAt}\n\n Updated at: ${lead.updatedAt}`,
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
    properties: ['hs_lead_label', 'hs_lead_name', 'hs_lead_type'],
    mapItemToAllowedValue: mapHubspotLead,
  });

  return leads;
};
