// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';
import { getGoogleAdsAdAllowedValues } from '../helpers/get-ad-allowed-values';

const action = 'update_ad_status';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
    on_change: ['refetch'],
  },
  ad_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdAllowedValues,
    depends_on: ['customer_id'],
  },
  status: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
      { value: 'REMOVED', display_name: 'Removed' },
    ],
  },
} satisfies TQoreOptions;

const statusMap: Record<string, number> = {
  ENABLED: enums.AdGroupAdStatus.ENABLED,
  PAUSED: enums.AdGroupAdStatus.PAUSED,
  REMOVED: enums.AdGroupAdStatus.REMOVED,
};

const updateAdStatus = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any, [
      'ad_group_id',
      'ad_id',
      'status',
    ]);

    const { ad_group_id, ad_id, status } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    if (!ad_id) {
      throw new GoogleAdsError('Ad ID is required');
    }

    if (!status) {
      throw new GoogleAdsError('Status is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        resource_name: `customers/${customerId}/adGroupAds/${ad_group_id}~${ad_id}`,
        status: statusMap[status],
      };

      const mutation: MutateOperation<resources.IAdGroupAd> = {
        entity: 'ad_group_ad',
        operation: 'update',
        resource: resource as resources.IAdGroupAd,
      };

      const response = await customer.mutateResources([mutation]);

      const resourceName = response.mutate_operation_responses?.find(
        (r) => r.ad_group_ad_result?.resource_name
      )?.ad_group_ad_result?.resource_name;

      return {
        resource_name: resourceName ?? '',
        ad_group_id,
        ad_id,
        status,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update ad status: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      ad_group_id: { type: 'string' },
      ad_id: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default updateAdStatus;
