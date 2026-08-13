// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  fromMicros,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'list_ad_groups';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
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

const listAdGroups = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { campaign_id, status_filter = 'ALL', limit = 100 } = obj || {};

    try {
      const whereClauses: string[] = ["ad_group.status != 'REMOVED'"];

      if (campaign_id) {
        whereClauses.push(`campaign.id = ${campaign_id}`);
      }

      if (status_filter && status_filter !== 'ALL') {
        whereClauses.push(`ad_group.status = '${status_filter}'`);
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const query = `
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.type,
          ad_group.cpc_bid_micros,
          campaign.name,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros
        FROM ad_group
        ${whereClause}
        ORDER BY ad_group.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.ad_group?.id),
        name: row.ad_group?.name ?? '',
        status: row.ad_group?.status ?? '',
        type: row.ad_group?.type ?? '',
        cpc_bid: row.ad_group?.cpc_bid_micros ? fromMicros(row.ad_group.cpc_bid_micros) : null,
        campaign_name: row.campaign?.name ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list ad groups: ${message}`);
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
        type: { type: 'string' },
        cpc_bid: { type: 'float' },
        campaign_name: { type: 'string' },
        clicks: { type: 'integer' },
        impressions: { type: 'integer' },
        cost: { type: 'float' },
      },
    },
  },
});

export default listAdGroups;
