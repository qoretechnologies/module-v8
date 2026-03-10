// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage, toMicros } from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';
import { getGoogleAdsKeywordAllowedValues } from '../helpers/get-keyword-allowed-values';

const action = 'update_keyword';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
    on_change: ['refetch'],
  },
  criterion_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsKeywordAllowedValues,
    depends_on: ['customer_id'],
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
  cpc_bid: {
    type: 'float',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const updateKeyword = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { ad_group_id, criterion_id, status, cpc_bid } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    if (!criterion_id) {
      throw new GoogleAdsError('Criterion ID is required');
    }

    if (!status && (cpc_bid === undefined || cpc_bid === null)) {
      throw new GoogleAdsError('At least one field to update (status or cpc_bid) is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        resource_name: `customers/${customerId}/adGroupCriteria/${ad_group_id}~${criterion_id}`,
      };

      if (status) {
        const statusMap: Record<string, number> = {
          ENABLED: enums.AdGroupCriterionStatus.ENABLED,
          PAUSED: enums.AdGroupCriterionStatus.PAUSED,
          REMOVED: enums.AdGroupCriterionStatus.REMOVED,
        };
        resource.status = statusMap[status] ?? enums.AdGroupCriterionStatus.ENABLED;
      }

      if (cpc_bid !== undefined && cpc_bid !== null) {
        resource.cpc_bid_micros = toMicros(cpc_bid);
      }

      const mutation: MutateOperation<any> = {
        entity: 'ad_group_criterion',
        operation: 'update',
        resource,
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.ad_group_criterion_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update keyword: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      success: { type: 'bool' },
    },
  },
});

export default updateKeyword;
