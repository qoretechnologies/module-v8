// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'remove_campaign';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
    depends_on: ['customer_id'],
  },
} satisfies TQoreOptions;

const removeCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const customerId = String(customer.credentials.customer_id).replace(/-/g, '');
    const resourceName = `customers/${customerId}/campaigns/${campaignId}`;

    try {
      const removeOperation: MutateOperation<resources.ICampaign> = {
        entity: 'campaign',
        operation: 'remove',
        resource: {
          resource_name: resourceName,
        },
      };

      await customer.mutateResources([removeOperation]);

      return {
        resource_name: resourceName,
        campaign_id: campaignId,
        removed: true,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to remove campaign: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      campaign_id: { type: 'string' },
      removed: { type: 'bool' },
    },
  },
});

export default removeCampaign;
