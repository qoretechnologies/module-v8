// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';

const action = 'list_customer_lists';

const options = {
  ...CUSTOMER_ID_OPTION,
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
} satisfies TQoreOptions;

const listCustomerLists = QoreAppCreator.createLocalizedAction<typeof options>({
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
          user_list.id,
          user_list.name,
          user_list.description,
          user_list.membership_status,
          user_list.size_for_display,
          user_list.size_for_search,
          user_list.type
        FROM user_list
        ORDER BY user_list.name ASC
        LIMIT ${limit}
      `;

      const results = await customer.query(query);

      return results.map((row) => ({
        id: String(row.user_list?.id),
        name: row.user_list?.name ?? '',
        description: row.user_list?.description ?? '',
        membership_status: String(row.user_list?.membership_status ?? ''),
        size_for_display: String(row.user_list?.size_for_display ?? '0'),
        size_for_search: String(row.user_list?.size_for_search ?? '0'),
        type: String(row.user_list?.type ?? ''),
      }));
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to list customer lists: ${message}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        membership_status: { type: 'string' },
        size_for_display: { type: 'string' },
        size_for_search: { type: 'string' },
        type: { type: 'string' },
      },
    },
  },
});

export default listCustomerLists;
