// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources, toMicros } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';

const action = 'create_campaign';

const options = {
  ...CUSTOMER_ID_OPTION,
  name: {
    type: 'string',
    required: true,
  },
  channel_type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'SEARCH', display_name: 'Search' },
      { value: 'DISPLAY', display_name: 'Display' },
      { value: 'SHOPPING', display_name: 'Shopping' },
      { value: 'VIDEO', display_name: 'Video' },
      { value: 'PERFORMANCE_MAX', display_name: 'Performance Max' },
    ],
  },
  status: {
    type: 'string',
    required: false,
    default_value: 'PAUSED',
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
    ],
  },
  daily_budget: {
    type: 'float',
    required: true,
  },
  bidding_strategy: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'MAXIMIZE_CONVERSIONS', display_name: 'Maximize Conversions' },
      { value: 'MAXIMIZE_CONVERSION_VALUE', display_name: 'Maximize Conversion Value' },
      { value: 'MAXIMIZE_CLICKS', display_name: 'Maximize Clicks' },
      { value: 'MANUAL_CPC', display_name: 'Manual CPC' },
      { value: 'TARGET_IMPRESSION_SHARE', display_name: 'Target Impression Share' },
    ],
  },
  target_google_search: {
    type: 'bool',
    required: false,
    default_value: true,
  },
  target_search_network: {
    type: 'bool',
    required: false,
    default_value: true,
  },
} satisfies TQoreOptions;

const channelTypeMap: Record<string, number> = {
  SEARCH: enums.AdvertisingChannelType.SEARCH,
  DISPLAY: enums.AdvertisingChannelType.DISPLAY,
  SHOPPING: enums.AdvertisingChannelType.SHOPPING,
  VIDEO: enums.AdvertisingChannelType.VIDEO,
  PERFORMANCE_MAX: enums.AdvertisingChannelType.PERFORMANCE_MAX,
};

const statusMap: Record<string, number> = {
  ENABLED: enums.CampaignStatus.ENABLED,
  PAUSED: enums.CampaignStatus.PAUSED,
};

const createCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(
      context as any,
      ['name', 'channel_type', 'daily_budget', 'bidding_strategy']
    );

    const {
      name,
      channel_type,
      status = 'PAUSED',
      daily_budget,
      bidding_strategy,
      target_google_search = true,
      target_search_network = true,
    } = obj || {};

    if (!name || !channel_type || daily_budget === undefined || daily_budget === null || !bidding_strategy) {
      throw new GoogleAdsError('Name, channel type, daily budget, and bidding strategy are required');
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');

    try {
      const budgetOperation: MutateOperation<resources.ICampaignBudget> = {
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          resource_name: `customers/${customerId}/campaignBudgets/-1`,
          name: `${name} Budget`,
          amount_micros: toMicros(daily_budget),
          delivery_method: enums.BudgetDeliveryMethod.STANDARD,
          explicitly_shared: false,
        },
      };

      const campaignResource: resources.ICampaign = {
        name,
        advertising_channel_type: channelTypeMap[channel_type],
        status: statusMap[status] ?? enums.CampaignStatus.PAUSED,
        campaign_budget: `customers/${customerId}/campaignBudgets/-1`,
        network_settings: {
          target_google_search: target_google_search ?? true,
          target_search_network: target_search_network ?? true,
          target_content_network: false,
          target_partner_search_network: false,
        },
      };

      // Set bidding strategy
      switch (bidding_strategy) {
        case 'MAXIMIZE_CONVERSIONS':
          campaignResource.maximize_conversions = {};
          break;
        case 'MAXIMIZE_CONVERSION_VALUE':
          campaignResource.maximize_conversion_value = {};
          break;
        case 'MAXIMIZE_CLICKS':
          campaignResource.target_spend = {};
          break;
        case 'MANUAL_CPC':
          campaignResource.manual_cpc = { enhanced_cpc_enabled: false };
          break;
        case 'TARGET_IMPRESSION_SHARE':
          campaignResource.target_impression_share = {
            location: enums.TargetImpressionShareLocation.ANYWHERE_ON_PAGE,
          };
          break;
        default:
          throw new GoogleAdsError(`Unsupported bidding strategy: ${bidding_strategy}`);
      }

      const campaignOperation: MutateOperation<resources.ICampaign> = {
        entity: 'campaign',
        operation: 'create',
        resource: campaignResource,
      };

      const response = await customer.mutateResources([budgetOperation, campaignOperation] as MutateOperation<
        resources.ICampaignBudget | resources.ICampaign
      >[]);

      const campaignResourceName = response.mutate_operation_responses?.find(
        (r) => r.campaign_result?.resource_name
      )?.campaign_result?.resource_name;

      return {
        resource_name: campaignResourceName ?? '',
        campaign_name: name,
        status: status,
        channel_type: channel_type,
        daily_budget: daily_budget,
        bidding_strategy: bidding_strategy,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create campaign: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      campaign_name: { type: 'string' },
      status: { type: 'string' },
      channel_type: { type: 'string' },
      daily_budget: { type: 'float' },
      bidding_strategy: { type: 'string' },
    },
  },
});

export default createCampaign;
