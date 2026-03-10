// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';

const action = 'run_campaign_report';

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

const runCampaignReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { date_range, start_date, end_date, status_filter = 'ALL', limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["campaign.status != 'REMOVED'"];

      if (status_filter && status_filter !== 'ALL') {
        whereClauses.push(`campaign.status = '${status_filter}'`);
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
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions,
          metrics.all_conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          metrics.conversions_value
        FROM campaign
        ${whereClause}
        ORDER BY campaign.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        campaign_id: String(row.campaign?.id),
        campaign_name: row.campaign?.name ?? '',
        status: row.campaign?.status ?? '',
        advertising_channel_type: row.campaign?.advertising_channel_type ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
        conversions: Number(row.metrics?.conversions ?? 0),
        all_conversions: Number(row.metrics?.all_conversions ?? 0),
        ctr: Number(row.metrics?.ctr ?? 0),
        average_cpc: row.metrics?.average_cpc ? fromMicros(row.metrics.average_cpc) : 0,
        average_cpm: row.metrics?.average_cpm ? fromMicros(row.metrics.average_cpm) : 0,
        conversions_value: Number(row.metrics?.conversions_value ?? 0),
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to run campaign report: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        campaign_id: { type: 'string' },
        campaign_name: { type: 'string' },
        status: { type: 'string' },
        advertising_channel_type: { type: 'string' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        cost: { type: 'float' },
        conversions: { type: 'float' },
        all_conversions: { type: 'float' },
        ctr: { type: 'float' },
        average_cpc: { type: 'float' },
        average_cpm: { type: 'float' },
        conversions_value: { type: 'float' },
      },
    },
  },
});

export default runCampaignReport;
