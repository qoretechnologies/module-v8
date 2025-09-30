import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PatreonError } from '../constants';
import { createPatreonClient } from './constants';

type PatreonMember = {
  id: string;
  attributes: {
    full_name: string | null;
    email: string | null;
    patron_status: string | null;
    currently_entitled_amount_cents: number | null;
    lifetime_support_cents: number | null;
    pledge_relationship_start: string | null;
  };
};

const mapPatreonMemberToAllowedValue = (item: PatreonMember): IQoreAllowedValue<string> => {
  const amountInDollars = item.attributes.currently_entitled_amount_cents
    ? (item.attributes.currently_entitled_amount_cents / 100).toFixed(2)
    : '0.00';

  const lifetimeInDollars = item.attributes.lifetime_support_cents
    ? (item.attributes.lifetime_support_cents / 100).toFixed(2)
    : '0.00';

  return {
    value: item.id,
    display_name: item.attributes.full_name || item.attributes.email || 'Unknown Member',
    desc:
      `Email: ${item.attributes.email || 'N/A'}\n` +
      `Status: ${item.attributes.patron_status || 'N/A'}\n` +
      `Current Pledge: $${amountInDollars}\n` +
      `Lifetime Support: $${lifetimeInDollars}\n` +
      `Member Since: ${item.attributes.pledge_relationship_start || 'N/A'}`,
  };
};

export const getPatreonMemberAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, campaignId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['campaignId'],
    ErrorClass: PatreonError,
  });

  try {
    const client = createPatreonClient(token);
    const query = QueryBuilder.campaignMembers
      .setAttributes({
        member: [
          'full_name',
          'email',
          'patron_status',
          'currently_entitled_amount_cents',
          'lifetime_support_cents',
          'pledge_relationship_start',
        ],
      })
      .setRequestOptions({
        count: 100,
      });

    const response = await client.fetchCampaignMembers(campaignId, query);

    return response.data.map(mapPatreonMemberToAllowedValue);
  } catch (error) {
    throw new PatreonError('Failed to fetch member allowed values: ' + error);
  }
};
