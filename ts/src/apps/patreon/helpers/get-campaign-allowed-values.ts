import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PatreonError } from '../constants';
import { createPatreonClient } from './constants';
type PatreonItem = {
  id: string;
  attributes: {
    creation_name: string | null;
    image_url: string | null;
    patron_count: number | null;
    summary: string | null;
    pledge_url: string | null;
  };
};

const mapPatreonItemToAllowedValue = (item: PatreonItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.attributes.creation_name || item.attributes.summary || 'Unknown',
    desc: `Patron Count: ${item.attributes.patron_count}\nSummary: ${item.attributes.summary}`,
    ...(item.attributes.image_url && { image: item.attributes.image_url }),
  };
};

export const getPatreonCampaignAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: PatreonError,
  });

  try {
    const client = createPatreonClient(token);
    const query = QueryBuilder.campaigns
      .setAttributes({
        campaign: [
          'creation_name',
          'image_url',
          'patron_count',
          'summary',
          'pledge_url',
        ],
      })
      .setRequestOptions({
        sort: { key: 'created_at', descending: true },
        count: 100,
      });

    const response = await client.fetchCampaigns(query);

    return response.data.map(mapPatreonItemToAllowedValue);
  } catch (error) {
    throw new PatreonError('Failed to fetch allowed values: ' + error);
  }
};
