import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotDeal = {
  id: string;
  properties: {
    amount: string;
    closedate: null;
    createdate: string;
    dealname: string;
    dealstage: string;
    hs_lastmodifieddate: string;
    hs_object_id: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotDeal = (deal: THubspotDeal): IQoreAllowedValue<string> => ({
  value: deal.id,
  display_name: deal.properties.dealname || deal.id,
  short_desc:
    `Amount: ${deal.properties.amount}\n\nDeal stage: ${deal.properties.dealstage}\n\n` +
    `Archived: ${deal.archived}\n\nCreated at: ${deal.createdAt}\n\nUpdated at: ${deal.updatedAt}`,
});

export const getHubspotDealAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot deal allowed values');
  }

  const deals = await fetchHubspotAllowedValues<THubspotDeal>({
    token,
    object: 'deals',
    mapItemToAllowedValue: mapHubspotDeal,
  });

  return deals;
};
