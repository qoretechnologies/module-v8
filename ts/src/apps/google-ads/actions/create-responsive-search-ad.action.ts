// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation, resources } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';

const action = 'create_responsive_search_ad';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
  },
  headlines: {
    type: { type: 'list', element_type: 'string' },
    required: true,
  },
  descriptions: {
    type: { type: 'list', element_type: 'string' },
    required: true,
  },
  final_urls: {
    type: { type: 'list', element_type: 'string' },
    required: true,
  },
  path1: {
    type: 'string',
    required: false,
  },
  path2: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
    default_value: 'PAUSED',
    allowed_values: [
      { value: 'ENABLED', display_name: 'Enabled' },
      { value: 'PAUSED', display_name: 'Paused' },
    ],
  },
} satisfies TQoreOptions;

const statusMap: Record<string, number> = {
  ENABLED: enums.AdGroupAdStatus.ENABLED,
  PAUSED: enums.AdGroupAdStatus.PAUSED,
};

const createResponsiveSearchAd = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(
      context as any,
      ['ad_group_id', 'headlines', 'descriptions', 'final_urls']
    );

    const {
      ad_group_id,
      headlines,
      descriptions,
      final_urls,
      path1,
      path2,
      status = 'PAUSED',
    } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      throw new GoogleAdsError('At least one headline is required');
    }

    if (!descriptions || !Array.isArray(descriptions) || descriptions.length === 0) {
      throw new GoogleAdsError('At least one description is required');
    }

    if (!final_urls || !Array.isArray(final_urls) || final_urls.length === 0) {
      throw new GoogleAdsError('At least one final URL is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const headlineAssets = headlines.map((text: string) => ({
        text,
      }));

      const descriptionAssets = descriptions.map((text: string) => ({
        text,
      }));

      const adResource: Record<string, unknown> = {
        responsive_search_ad: {
          headlines: headlineAssets,
          descriptions: descriptionAssets,
          ...(path1 ? { path1 } : {}),
          ...(path2 ? { path2 } : {}),
        },
        final_urls,
      };

      const resource: Record<string, unknown> = {
        ad_group: `customers/${customerId}/adGroups/${ad_group_id}`,
        status: statusMap[status] ?? enums.AdGroupAdStatus.PAUSED,
        ad: adResource,
      };

      const mutation: MutateOperation<resources.IAdGroupAd> = {
        entity: 'ad_group_ad',
        operation: 'create',
        resource: resource as resources.IAdGroupAd,
      };

      const response = await customer.mutateResources([mutation]);

      const resourceName = response.mutate_operation_responses?.find(
        (r) => r.ad_group_ad_result?.resource_name
      )?.ad_group_ad_result?.resource_name;

      return {
        resource_name: resourceName ?? '',
        ad_group_id,
        headlines,
        descriptions,
        final_urls,
        path1: path1 ?? null,
        path2: path2 ?? null,
        status,
      };
    } catch (error: unknown) {
      if (error instanceof GoogleAdsError) {
        throw error;
      }
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to create responsive search ad: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      resource_name: { type: 'string' },
      ad_group_id: { type: 'string' },
      headlines: { type: { type: 'list', element_type: 'string' } },
      descriptions: { type: { type: 'list', element_type: 'string' } },
      final_urls: { type: { type: 'list', element_type: 'string' } },
      path1: { type: 'string' },
      path2: { type: 'string' },
      status: { type: 'string' },
    },
  },
});

export default createResponsiveSearchAd;
