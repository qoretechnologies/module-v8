import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PatreonError } from '../constants';
import { createPatreonClient } from './constants';

type PatreonPost = {
  id: string;
  attributes: {
    title: string | null;
    content: string | null;
    published_at: string | null;
    url: string | null;
    is_paid: boolean | null;
    is_public: boolean | null;
  };
};

const mapPatreonPostToAllowedValue = (item: PatreonPost): IQoreAllowedValue<string> => {
  const accessLabel = item.attributes.is_public
    ? 'Public'
    : item.attributes.is_paid
      ? 'Paid Only'
      : 'Private';

  const publishedDate = item.attributes.published_at
    ? new Date(item.attributes.published_at).toLocaleDateString()
    : 'Not Published';

  return {
    value: item.id,
    display_name: item.attributes.title || 'Untitled Post',
    desc: `Access: ${accessLabel}\n` + `Published: ${publishedDate}\n`,
  };
};

export const getPatreonPostAllowedValues: TQoreGetAllowedValuesFunction<
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
    const query = QueryBuilder.campaignPosts
      .setAttributes({
        post: ['title', 'content', 'published_at', 'url', 'is_paid', 'is_public'],
      })
      .setRequestOptions({
        count: 100,
      });

    const response = await client.fetchCampaignPosts(campaignId, query);

    return response.data.map(mapPatreonPostToAllowedValue);
  } catch (error) {
    throw new PatreonError('Failed to fetch post allowed values: ' + error);
  }
};
