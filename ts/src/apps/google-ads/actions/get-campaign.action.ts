// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, fromMicros, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'get_campaign';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
  },
} satisfies TQoreOptions;

const getCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, ['campaign_id']);

    const campaignId = obj?.campaign_id;
    if (!campaignId) {
      throw new GoogleAdsError('Campaign ID is required');
    }

    try {
      const results = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.start_date_time,
          campaign.end_date_time,
          campaign.serving_status,
          campaign.network_settings.target_google_search,
          campaign.network_settings.target_search_network,
          campaign.network_settings.target_content_network,
          campaign_budget.amount_micros,
          campaign_budget.name,
          campaign_budget.delivery_method,
          metrics.clicks,
          metrics.impressions,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.id = ${campaignId}
      `);

      if (!results.length) {
        throw new GoogleAdsError(`Campaign with ID ${campaignId} not found`);
      }

      const row = results[0];

      return {
        id: String(row.campaign?.id),
        name: row.campaign?.name ?? '',
        status: row.campaign?.status ?? '',
        advertising_channel_type: row.campaign?.advertising_channel_type ?? '',
        bidding_strategy_type: row.campaign?.bidding_strategy_type ?? '',
        start_date: row.campaign?.start_date_time ?? null,
        end_date: row.campaign?.end_date_time ?? null,
        serving_status: row.campaign?.serving_status ?? '',
        target_google_search: row.campaign?.network_settings?.target_google_search ?? false,
        target_search_network: row.campaign?.network_settings?.target_search_network ?? false,
        target_content_network: row.campaign?.network_settings?.target_content_network ?? false,
        budget_name: row.campaign_budget?.name ?? '',
        daily_budget: row.campaign_budget?.amount_micros
          ? fromMicros(row.campaign_budget.amount_micros)
          : null,
        budget_delivery_method: row.campaign_budget?.delivery_method ?? '',
        clicks: Number(row.metrics?.clicks ?? 0),
        impressions: Number(row.metrics?.impressions ?? 0),
        cost: row.metrics?.cost_micros ? fromMicros(row.metrics.cost_micros) : 0,
        conversions: Number(row.metrics?.conversions ?? 0),
        ctr: Number(row.metrics?.ctr ?? 0),
        average_cpc: row.metrics?.average_cpc ? fromMicros(row.metrics.average_cpc) : 0,
        average_cpm: row.metrics?.average_cpm ? fromMicros(row.metrics.average_cpm) : 0,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to get campaign: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
      advertising_channel_type: { type: 'string' },
      bidding_strategy_type: { type: 'string' },
      start_date: { type: 'string' },
      end_date: { type: 'string' },
      serving_status: { type: 'string' },
      target_google_search: { type: 'bool' },
      target_search_network: { type: 'bool' },
      target_content_network: { type: 'bool' },
      budget_name: { type: 'string' },
      daily_budget: { type: 'float' },
      budget_delivery_method: { type: 'string' },
      clicks: { type: 'integer' },
      impressions: { type: 'integer' },
      cost: { type: 'float' },
      conversions: { type: 'float' },
      ctr: { type: 'float' },
      average_cpc: { type: 'float' },
      average_cpm: { type: 'float' },
    },
  },
});

export default getCampaign;
