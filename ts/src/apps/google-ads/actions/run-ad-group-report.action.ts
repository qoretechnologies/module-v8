// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'run_ad_group_report';

const DATE_RANGE_ALLOWED_VALUES = [
  { display_name: 'Last 7 Days', value: 'LAST_7_DAYS' },
  { display_name: 'Last 14 Days', value: 'LAST_14_DAYS' },
  { display_name: 'Last 30 Days', value: 'LAST_30_DAYS' },
  { display_name: 'This Month', value: 'THIS_MONTH' },
  { display_name: 'Last Month', value: 'LAST_MONTH' },
  { display_name: 'Custom', value: 'CUSTOM' },
];

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
  },
  date_range: {
    type: 'string',
    required: true,
    default_value: 'LAST_30_DAYS',
    allowed_values: DATE_RANGE_ALLOWED_VALUES,
  },
  start_date: {
    type: 'date',
    required: false,
  },
  end_date: {
    type: 'date',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const runAdGroupReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { campaign_id, date_range, start_date, end_date, limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["ad_group.status != 'REMOVED'"];

      if (campaign_id) {
        whereClauses.push(`campaign.id = ${campaign_id}`);
      }

      if (date_range === 'CUSTOM') {
        if (start_date && end_date) {
          whereClauses.push(`segments.date BETWEEN '${start_date}' AND '${end_date}'`);
        }
      } else if (date_range) {
        whereClauses.push(`segments.date DURING ${date_range}`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          campaign.id,
          campaign.name,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM ad_group
        ${whereClause}
        ORDER BY ad_group.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        ad_group_id: String(row.ad_group?.id),
        ad_group_name: row.ad_group?.name ?? '',
        ad_group_status: row.ad_group?.status ?? '',
        campaign_id: String(row.campaign?.id),
        campaign_name: row.campaign?.name ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
        conversions: Number(row.metrics?.conversions ?? 0),
        ctr: Number(row.metrics?.ctr ?? 0),
        average_cpc: row.metrics?.average_cpc ? fromMicros(row.metrics.average_cpc) : 0,
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to run ad group report: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        ad_group_id: { type: 'string' },
        ad_group_name: { type: 'string' },
        ad_group_status: { type: 'string' },
        campaign_id: { type: 'string' },
        campaign_name: { type: 'string' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        cost: { type: 'float' },
        conversions: { type: 'float' },
        ctr: { type: 'float' },
        average_cpc: { type: 'float' },
      },
    },
  },
});

export default runAdGroupReport;
