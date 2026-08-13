// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'update_campaign';

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
    required: false,
    required_groups: ['update_field'],
  },
  status: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
      { value: 'REMOVED', display_name: 'Removed' },
    ],
  },
} satisfies TQoreOptions;

const statusMap: Record<string, number> = {
  ENABLED: enums.CampaignStatus.ENABLED,
  PAUSED: enums.CampaignStatus.PAUSED,
  REMOVED: enums.CampaignStatus.REMOVED,
};

const updateCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any, ['campaign_id']);

    const { campaign_id, name, status } = obj || {};

    if (!campaign_id) {
      throw new GoogleAdsError('Campaign ID is required');
    }

    if (!name && !status) {
      throw new GoogleAdsError('At least one field to update (name or status) is required');
    }

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');

    try {
      const campaignResource: resources.ICampaign = {
        resource_name: `customers/${customerId}/campaigns/${campaign_id}`,
      };

      if (name) {
        campaignResource.name = name;
      }

      if (status) {
        campaignResource.status = statusMap[status];
      }

      const updateOperation: MutateOperation<resources.ICampaign> = {
        entity: 'campaign',
        operation: 'update',
        resource: campaignResource,
      };

      const response = await customer.mutateResources([updateOperation]);

      const updatedResourceName =
        response.mutate_operation_responses?.[0]?.campaign_result?.resource_name;

      return {
        resource_name: updatedResourceName ?? `customers/${customerId}/campaigns/${campaign_id}`,
        campaign_id: campaign_id,
        ...(name && { name }),
        ...(status && { status }),
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update campaign: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      campaign_id: { type: 'string' },
      name: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default updateCampaign;
