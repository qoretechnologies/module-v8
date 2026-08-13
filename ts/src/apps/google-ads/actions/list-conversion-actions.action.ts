// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';

const action = 'list_conversion_actions';

const options = {
  ...CUSTOMER_ID_OPTION,
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listConversionActions = QoreAppCreator.createLocalizedAction<typeof options>({
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
          conversion_action.id,
          conversion_action.name,
          conversion_action.type,
          conversion_action.status,
          conversion_action.category
        FROM conversion_action
        ORDER BY conversion_action.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.conversion_action?.id),
        name: row.conversion_action?.name ?? '',
        type: row.conversion_action?.type ?? '',
        status: row.conversion_action?.status ?? '',
        category: row.conversion_action?.category ?? '',
      }));
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list conversion actions: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string' },
        category: { type: 'string' },
      },
    },
  },
});

export default listConversionActions;
