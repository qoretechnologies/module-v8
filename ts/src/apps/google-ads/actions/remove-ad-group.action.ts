// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
} from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';

const action = 'remove_ad_group';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
  },
} satisfies TQoreOptions;

const removeAdGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any, [
      'ad_group_id',
    ]);

    const { ad_group_id } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const mutation: MutateOperation<resources.IAdGroup> = {
        entity: 'ad_group',
        operation: 'remove',
        resource: {
          resource_name: `customers/${customerId}/adGroups/${ad_group_id}`,
        } as resources.IAdGroup,
      };

      await customer.mutateResources([mutation]);

      return {
        ad_group_id,
        removed: true,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to remove ad group: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      ad_group_id: { type: 'string' },
      removed: { type: 'bool' },
    },
  },
});

export default removeAdGroup;
