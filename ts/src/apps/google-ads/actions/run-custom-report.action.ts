// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';

const action = 'run_custom_report';

const options = {
  ...CUSTOMER_ID_OPTION,
  query: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const runCustomReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer } = getGoogleAdsCustomerFromContext(context as any);

    const query = obj?.query;
    if (!query) {
      throw new GoogleAdsError('GAQL query is required');
    }

    try {
      const results = await customer.query(query);
      return results;
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to run custom report: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {},
    },
  },
});

export default runCustomReport;
