// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
  toMicros,
} from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'create_ad_group';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
  },
  name: {
    type: 'string',
    required: true,
  },
  type: {
    type: 'string',
    required: false,
    default_value: 'SEARCH_STANDARD',
    allowed_values: [
      { value: 'SEARCH_STANDARD', display_name: 'Search Standard' },
      { value: 'DISPLAY_STANDARD', display_name: 'Display Standard' },
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
  cpc_bid: {
    type: 'float',
    required: false,
  },
} satisfies TQoreOptions;

const typeMap: Record<string, number> = {
  SEARCH_STANDARD: enums.AdGroupType.SEARCH_STANDARD,
  DISPLAY_STANDARD: enums.AdGroupType.DISPLAY_STANDARD,
};

const statusMap: Record<string, number> = {
  ENABLED: enums.AdGroupStatus.ENABLED,
  PAUSED: enums.AdGroupStatus.PAUSED,
};

const createAdGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any, [
      'campaign_id',
      'name',
    ]);

    const { campaign_id, name, type = 'SEARCH_STANDARD', status = 'PAUSED', cpc_bid } = obj || {};

    if (!campaign_id || !name) {
      throw new GoogleAdsError('Campaign ID and name are required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        campaign: `customers/${customerId}/campaigns/${campaign_id}`,
        name,
        type: typeMap[type] ?? enums.AdGroupType.SEARCH_STANDARD,
        status: statusMap[status] ?? enums.AdGroupStatus.PAUSED,
      };

      if (cpc_bid !== undefined && cpc_bid !== null) {
        resource.cpc_bid_micros = toMicros(cpc_bid);
      }

      const mutation: MutateOperation<resources.IAdGroup> = {
        entity: 'ad_group',
        operation: 'create',
        resource: resource as resources.IAdGroup,
      };

      const response = await customer.mutateResources([mutation]);

      const resourceName = response.mutate_operation_responses?.find(
        (r) => r.ad_group_result?.resource_name
      )?.ad_group_result?.resource_name;

      return {
        resource_name: resourceName ?? '',
        name,
        type,
        status,
        cpc_bid: cpc_bid ?? null,
        campaign_id,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create ad group: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },
      status: { type: 'string' },
      cpc_bid: { type: 'float' },
      campaign_id: { type: 'string' },
    },
  },
});

export default createAdGroup;
