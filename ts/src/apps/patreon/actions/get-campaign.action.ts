import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { QueryBuilder } from 'patreon-api.ts';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { PATREON_APP_NAME, PatreonError } from '../constants';
import { createPatreonClient } from '../helpers/constants';
import { getPatreonCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'get_campaign';

const options = {
  campaignId: {
    type: 'string',
    required: true,
    get_allowed_values: getPatreonCampaignAllowedValues,
  },
} satisfies TQoreOptions;

const getCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: PATREON_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, campaignId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['campaignId'],
      ErrorClass: PatreonError,
    });

    try {
      const client = createPatreonClient(token);
      const query = QueryBuilder.campaign.setAttributes({
        campaign: [
          'created_at',
          'creation_name',
          'discord_server_id',
          'image_small_url',
          'image_url',
          'is_charged_immediately',
          'is_monthly',
          'is_nsfw',
          'main_video_embed',
          'main_video_url',
          'one_liner',
          'patron_count',
          'pay_per_name',
          'pledge_url',
          'published_at',
          'summary',
          'thanks_embed',
          'thanks_msg',
          'thanks_video_url',
          'has_rss',
          'has_sent_rss_notify',
          'rss_feed_title',
          'rss_artwork_url',
          'google_analytics_id',
        ],
      });

      const response = await client.fetchCampaign(campaignId, query);

      return {
        id: response.data.id,
        ...response.data.attributes,
      };
    } catch (error) {
      throw new PatreonError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      summary: { type: 'string' },
      creation_name: { type: 'string' },
      pay_per_name: { type: 'string' },
      one_liner: { type: 'string' },
      main_video_embed: { type: 'string' },
      main_video_url: { type: 'string' },
      image_url: { type: 'string' },
      image_small_url: { type: 'string' },
      thanks_video_url: { type: 'string' },
      thanks_embed: { type: 'string' },
      thanks_msg: { type: 'string' },
      is_monthly: { type: 'boolean' },
      has_rss: { type: 'boolean' },
      has_sent_rss_notify: { type: 'boolean' },
      rss_feed_title: { type: 'string' },
      rss_artwork_url: { type: 'string' },
      is_nsfw: { type: 'boolean' },
      is_charged_immediately: { type: 'boolean' },
      created_at: { type: 'string' },
      published_at: { type: 'string' },
      pledge_url: { type: 'string' },
      patron_count: { type: 'integer' },
      discord_server_id: { type: 'string' },
      google_analytics_id: { type: 'string' },
    },
  },
});

export default getCampaign;
