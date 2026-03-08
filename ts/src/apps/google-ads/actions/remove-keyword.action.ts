// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';
import { getGoogleAdsKeywordAllowedValues } from '../helpers/get-keyword-allowed-values';

const action = 'remove_keyword';

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
} satisfies TQoreOptions;

const removeKeyword = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { ad_group_id, criterion_id } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    if (!criterion_id) {
      throw new GoogleAdsError('Criterion ID is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const mutation: MutateOperation<any> = {
        entity: 'ad_group_criterion',
        operation: 'remove',
        resource: `customers/${customerId}/adGroupCriteria/${ad_group_id}~${criterion_id}`,
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.ad_group_criterion_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to remove keyword: ${message}`);
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

export default removeKeyword;
