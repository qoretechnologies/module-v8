// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';

const action = 'list_bidding_strategies';

const options = {
  ...CUSTOMER_ID_OPTION,
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listBiddingStrategies = QoreAppCreator.createLocalizedAction<typeof options>({
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
          bidding_strategy.id,
          bidding_strategy.name,
          bidding_strategy.type,
          bidding_strategy.status
        FROM bidding_strategy
        ORDER BY bidding_strategy.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.bidding_strategy?.id ?? ''),
        name: row.bidding_strategy?.name ?? '',
        type: row.bidding_strategy?.type ?? '',
        status: row.bidding_strategy?.status ?? '',
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list bidding strategies: ${message}`);
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
      },
    },
  },
});

export default listBiddingStrategies;
