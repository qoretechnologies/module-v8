// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  fromMicros,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';

const action = 'list_budgets';

const options = {
  ...CUSTOMER_ID_OPTION,
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listBudgets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const { limit = 100 } = obj || {};

    try {
      const query = `
        SELECT
          campaign_budget.id,
          campaign_budget.name,
          campaign_budget.amount_micros,
          campaign_budget.status,
          campaign_budget.delivery_method
        FROM campaign_budget
        ORDER BY campaign_budget.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.campaign_budget?.id ?? ''),
        name: row.campaign_budget?.name ?? '',
        daily_amount: row.campaign_budget?.amount_micros
          ? fromMicros(row.campaign_budget.amount_micros)
          : 0,
        status: row.campaign_budget?.status ?? '',
        delivery_method: row.campaign_budget?.delivery_method ?? '',
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list budgets: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        daily_amount: { type: 'float' },
        status: { type: 'string' },
        delivery_method: { type: 'string' },
      },
    },
  },
});

export default listBudgets;
