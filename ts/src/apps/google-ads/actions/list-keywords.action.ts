// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';

const action = 'list_keywords';

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
  date_range: {
    type: 'string',
    required: false,
    default_value: 'ALL_TIME',
    allowed_values: [
      { value: 'LAST_7_DAYS', display_name: 'Last 7 Days' },
      { value: 'LAST_14_DAYS', display_name: 'Last 14 Days' },
      { value: 'LAST_30_DAYS', display_name: 'Last 30 Days' },
      { value: 'THIS_MONTH', display_name: 'This Month' },
      { value: 'ALL_TIME', display_name: 'All Time' },
    ],
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listKeywords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { campaign_id, ad_group_id, date_range = 'ALL_TIME', limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["ad_group_criterion.status != 'REMOVED'"];

      if (campaign_id) {
        whereClauses.push(`campaign.id = ${campaign_id}`);
      }

      if (ad_group_id) {
        whereClauses.push(`ad_group.id = ${ad_group_id}`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const dateClause =
        date_range && date_range !== 'ALL_TIME' ? `AND segments.date DURING ${date_range}` : '';

      const query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.criterion_id,
          ad_group_criterion.cpc_bid_micros,
          campaign.name,
          ad_group.name,
          metrics.clicks,
          metrics.impressions,
          metrics.average_cpc,
          metrics.conversions
        FROM keyword_view
        ${whereClause}
        ${dateClause}
        ORDER BY ad_group_criterion.keyword.text ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        keyword_text: row.ad_group_criterion?.keyword?.text ?? '',
        match_type: row.ad_group_criterion?.keyword?.match_type ?? '',
        status: row.ad_group_criterion?.status ?? '',
        criterion_id: String(row.ad_group_criterion?.criterion_id ?? ''),
        cpc_bid: row.ad_group_criterion?.cpc_bid_micros
          ? fromMicros(row.ad_group_criterion.cpc_bid_micros)
          : null,
        campaign_name: row.campaign?.name ?? '',
        ad_group_name: row.ad_group?.name ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        average_cpc: row.metrics?.average_cpc ? fromMicros(row.metrics.average_cpc) : 0,
        conversions: Number(row.metrics?.conversions ?? 0),
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list keywords: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        keyword_text: { type: 'string' },
        match_type: { type: 'string' },
        status: { type: 'string' },
        criterion_id: { type: 'string' },
        cpc_bid: { type: 'float' },
        campaign_name: { type: 'string' },
        ad_group_name: { type: 'string' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        average_cpc: { type: 'float' },
        conversions: { type: 'float' },
      },
    },
  },
});

export default listKeywords;
