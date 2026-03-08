// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';

const action = 'list_campaigns';

const options = {
  ...CUSTOMER_ID_OPTION,
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
  date_range: {
    type: 'string',
    required: false,
    default_value: 'ALL_TIME',
    allowed_values: [
      { value: 'LAST_7_DAYS', display_name: 'Last 7 Days' },
      { value: 'LAST_14_DAYS', display_name: 'Last 14 Days' },
      { value: 'LAST_30_DAYS', display_name: 'Last 30 Days' },
      { value: 'THIS_MONTH', display_name: 'This Month' },
      { value: 'LAST_MONTH', display_name: 'Last Month' },
      { value: 'ALL_TIME', display_name: 'All Time' },
    ],
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listCampaigns = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { status_filter = 'ALL', date_range = 'ALL_TIME', limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["campaign.status != 'REMOVED'"];

      if (status_filter && status_filter !== 'ALL') {
        whereClauses.push(`campaign.status = '${status_filter}'`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const dateClause = date_range && date_range !== 'ALL_TIME'
        ? `AND segments.date DURING ${date_range}`
        : '';

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign_budget.amount_micros,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions
        FROM campaign
        ${whereClause}
        ${dateClause}
        ORDER BY campaign.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.campaign?.id),
        name: row.campaign?.name ?? '',
        status: row.campaign?.status ?? '',
        advertising_channel_type: row.campaign?.advertising_channel_type ?? '',
        daily_budget: row.campaign_budget?.amount_micros
          ? fromMicros(row.campaign_budget.amount_micros)
          : null,
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
        conversions: Number(row.metrics?.conversions ?? 0),
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list campaigns: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'string' },
        advertising_channel_type: { type: 'string' },
        daily_budget: { type: 'float' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        cost: { type: 'float' },
        conversions: { type: 'float' },
      },
    },
  },
});

export default listCampaigns;
