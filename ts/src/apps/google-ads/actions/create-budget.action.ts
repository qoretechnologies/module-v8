// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage, toMicros } from '../helpers/constants';

const action = 'create_budget';

const options = {
  ...CUSTOMER_ID_OPTION,
  name: {
    type: 'string',
    required: true,
  },
  daily_amount: {
    type: 'float',
    required: true,
  },
  delivery_method: {
    type: 'string',
    required: false,
    default_value: 'STANDARD',
    allowed_values: [
      { value: 'STANDARD', display_name: 'Standard' },
      { value: 'ACCELERATED', display_name: 'Accelerated' },
    ],
  },
} satisfies TQoreOptions;

const createBudget = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { name, daily_amount, delivery_method = 'STANDARD' } = obj || {};

    if (!name) {
      throw new GoogleAdsError('Budget name is required');
    }

    if (daily_amount === undefined || daily_amount === null) {
      throw new GoogleAdsError('Daily amount is required');
    }

    try {
      const deliveryMethodValue =
        delivery_method === 'ACCELERATED'
          ? enums.BudgetDeliveryMethod.ACCELERATED
          : enums.BudgetDeliveryMethod.STANDARD;

      const mutation: MutateOperation<any> = {
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          name,
          amount_micros: toMicros(daily_amount),
          delivery_method: deliveryMethodValue,
          explicitly_shared: true,
        },
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.campaign_budget_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create budget: ${message}`);
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

export default createBudget;
