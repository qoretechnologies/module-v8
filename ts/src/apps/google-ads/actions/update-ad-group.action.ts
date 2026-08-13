// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
  toMicros,
} from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';

const action = 'update_ad_group';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
  },
  name: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
  status: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
      { value: 'REMOVED', display_name: 'Removed' },
    ],
  },
  cpc_bid: {
    type: 'float',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const statusMap: Record<string, number> = {
  ENABLED: enums.AdGroupStatus.ENABLED,
  PAUSED: enums.AdGroupStatus.PAUSED,
  REMOVED: enums.AdGroupStatus.REMOVED,
};

const updateAdGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any, [
      'ad_group_id',
    ]);

    const { ad_group_id, name, status, cpc_bid } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const resource: Record<string, unknown> = {
        resource_name: `customers/${customerId}/adGroups/${ad_group_id}`,
      };

      if (name !== undefined && name !== null) {
        resource.name = name;
      }

      if (status !== undefined && status !== null) {
        resource.status = statusMap[status] ?? undefined;
      }

      if (cpc_bid !== undefined && cpc_bid !== null) {
        resource.cpc_bid_micros = toMicros(cpc_bid);
      }

      const mutation: MutateOperation<resources.IAdGroup> = {
        entity: 'ad_group',
        operation: 'update',
        resource: resource as resources.IAdGroup,
      };

      const response = await customer.mutateResources([mutation]);

      const resourceName = response.mutate_operation_responses?.find(
        (r) => r.ad_group_result?.resource_name
      )?.ad_group_result?.resource_name;

      return {
        resource_name: resourceName ?? '',
        ad_group_id,
        updated_fields: {
          ...(name !== undefined && name !== null ? { name } : {}),
          ...(status !== undefined && status !== null ? { status } : {}),
          ...(cpc_bid !== undefined && cpc_bid !== null ? { cpc_bid } : {}),
        },
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to update ad group: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      ad_group_id: { type: 'string' },
      updated_fields: {
        type: {
          type: 'hash',
          fields: {
            name: { type: 'string' },
            status: { type: 'string' },
            cpc_bid: { type: 'float' },
          },
        },
      },
    },
  },
});

export default updateAdGroup;
