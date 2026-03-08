// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage, toMicros } from '../helpers/constants';
import { getGoogleAdsBiddingStrategyAllowedValues } from '../helpers/get-bidding-strategy-allowed-values';

const action = 'update_bidding_strategy';

const options = {
  ...CUSTOMER_ID_OPTION,
  strategy_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsBiddingStrategyAllowedValues,
    depends_on: ['customer_id'],
  },
  name: {
    type: 'string',
    required: false,
  },
  target_cpa: {
    type: 'float',
    required: false,
  },
  target_roas: {
    type: 'float',
    required: false,
  },
} satisfies TQoreOptions;

const updateBiddingStrategy = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { strategy_id, name, target_cpa, target_roas } = obj || {};

    if (!strategy_id) {
      throw new GoogleAdsError('Strategy ID is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        resource_name: `customers/${customerId}/biddingStrategies/${strategy_id}`,
      };

      if (name !== undefined && name !== null && name !== '') {
        resource.name = name;
      }

      if (target_cpa !== undefined && target_cpa !== null) {
        resource.target_cpa = {
          target_cpa_micros: toMicros(target_cpa),
        };
      }

      if (target_roas !== undefined && target_roas !== null) {
        resource.target_roas = {
          target_roas: target_roas,
        };
      }

      const mutation: MutateOperation<any> = {
        entity: 'bidding_strategy',
        operation: 'update',
        resource,
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.bidding_strategy_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update bidding strategy: ${message}`);
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

export default updateBiddingStrategy;
