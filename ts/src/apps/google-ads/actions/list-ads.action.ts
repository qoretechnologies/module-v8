// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'list_ads';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
    on_change: ['refetch'],
  },
  ad_group_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
  },
  status_filter: {
    type: 'string',
    required: false,
    default_value: 'ALL',
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
      { value: 'ALL', display_name: 'All' },
    ],
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listAds = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { campaign_id, ad_group_id, status_filter = 'ALL', limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["ad_group_ad.status != 'REMOVED'"];

      if (status_filter && status_filter !== 'ALL') {
        whereClauses.push(`ad_group_ad.status = '${status_filter}'`);
      }

      if (campaign_id) {
        whereClauses.push(`campaign.id = ${campaign_id}`);
      }

      if (ad_group_id) {
        whereClauses.push(`ad_group.id = ${ad_group_id}`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          ad_group_ad.ad.id,
          ad_group_ad.ad.type,
          ad_group_ad.ad.final_urls,
          ad_group_ad.status,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros
        FROM ad_group_ad
        ${whereClause}
        ORDER BY ad_group_ad.ad.id ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        ad_id: String(row.ad_group_ad?.ad?.id),
        ad_type: row.ad_group_ad?.ad?.type ?? '',
        final_urls: row.ad_group_ad?.ad?.final_urls ?? [],
        status: row.ad_group_ad?.status ?? '',
        ad_group_id: String(row.ad_group?.id),
        ad_group_name: row.ad_group?.name ?? '',
        campaign_id: String(row.campaign?.id),
        campaign_name: row.campaign?.name ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list ads: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        ad_id: { type: 'string' },
        ad_type: { type: 'string' },
        final_urls: { type: { type: 'list', element_type: 'string' } },
        status: { type: 'string' },
        ad_group_id: { type: 'string' },
        ad_group_name: { type: 'string' },
        campaign_id: { type: 'string' },
        campaign_name: { type: 'string' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        cost: { type: 'float' },
      },
    },
  },
});

export default listAds;
