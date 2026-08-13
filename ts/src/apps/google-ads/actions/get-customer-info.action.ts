// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';

const action = 'get_customer_info';

const options = {
  ...CUSTOMER_ID_OPTION,
} satisfies TQoreOptions;

const getCustomerInfo = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (_obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    try {
      const results = await customer.query(`
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone
        FROM customer
        LIMIT 1
      `);

      if (!results.length) {
        throw new GoogleAdsError('No customer information found');
      }

      const row = results[0];

      return {
        id: String(row.customer?.id),
        descriptive_name: row.customer?.descriptive_name ?? '',
        currency_code: row.customer?.currency_code ?? '',
        time_zone: row.customer?.time_zone ?? '',
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to get customer info: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      descriptive_name: { type: 'string' },
      currency_code: { type: 'string' },
      time_zone: { type: 'string' },
    },
  },
});

export default getCustomerInfo;
