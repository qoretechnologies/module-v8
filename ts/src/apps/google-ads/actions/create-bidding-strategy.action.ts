// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
  toMicros,
} from '../helpers/constants';

const action = 'create_bidding_strategy';

const options = {
  ...CUSTOMER_ID_OPTION,
  name: {
    type: 'string',
    required: true,
  },
  type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'TARGET_CPA', display_name: 'Target CPA' },
      { value: 'TARGET_ROAS', display_name: 'Target ROAS' },
      { value: 'MAXIMIZE_CONVERSIONS', display_name: 'Maximize Conversions' },
      { value: 'MAXIMIZE_CONVERSION_VALUE', display_name: 'Maximize Conversion Value' },
    ],
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

const createBiddingStrategy = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { name, type, target_cpa, target_roas } = obj || {};

    if (!name) {
      throw new GoogleAdsError('Strategy name is required');
    }

    if (!type) {
      throw new GoogleAdsError('Strategy type is required');
    }

    try {
      const resource: Record<string, unknown> = {
        name,
      };

      switch (type) {
        case 'TARGET_CPA':
          if (target_cpa === undefined || target_cpa === null) {
            throw new GoogleAdsError('Target CPA is required for TARGET_CPA strategy');
          }
          resource.target_cpa = {
            target_cpa_micros: toMicros(target_cpa),
          };
          break;
        case 'TARGET_ROAS':
          if (target_roas === undefined || target_roas === null) {
            throw new GoogleAdsError('Target ROAS is required for TARGET_ROAS strategy');
          }
          resource.target_roas = {
            target_roas: target_roas,
          };
          break;
        case 'MAXIMIZE_CONVERSIONS':
          resource.maximize_conversions = {};
          break;
        case 'MAXIMIZE_CONVERSION_VALUE':
          resource.maximize_conversion_value = {};
          break;
        default:
          throw new GoogleAdsError(`Unsupported strategy type: ${type}`);
      }

      const mutation: MutateOperation<any> = {
        entity: 'bidding_strategy',
        operation: 'create',
        resource,
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.bidding_strategy_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create bidding strategy: ${message}`);
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

export default createBiddingStrategy;
