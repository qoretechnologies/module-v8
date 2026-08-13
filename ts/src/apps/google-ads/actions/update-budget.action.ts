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
import { getGoogleAdsBudgetAllowedValues } from '../helpers/get-budget-allowed-values';

const action = 'update_budget';

const options = {
  ...CUSTOMER_ID_OPTION,
  budget_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsBudgetAllowedValues,
    depends_on: ['customer_id'],
  },
  name: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
  daily_amount: {
    type: 'float',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const updateBudget = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { budget_id, name, daily_amount } = obj || {};

    if (!budget_id) {
      throw new GoogleAdsError('Budget ID is required');
    }

    if ((name === undefined || name === null || name === '') && daily_amount === undefined) {
      throw new GoogleAdsError('At least one field to update (name or daily_amount) is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        resource_name: `customers/${customerId}/campaignBudgets/${budget_id}`,
      };

      if (name !== undefined && name !== null && name !== '') {
        resource.name = name;
      }

      if (daily_amount !== undefined && daily_amount !== null) {
        resource.amount_micros = toMicros(daily_amount);
      }

      const mutation: MutateOperation<any> = {
        entity: 'campaign_budget',
        operation: 'update',
        resource,
      };

      const response = await customer.mutateResources([mutation]);

      return {
        resource_name:
          response.mutate_operation_responses?.[0]?.campaign_budget_result?.resource_name ?? '',
        success: true,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update budget: ${message}`);
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

export default updateBudget;
