// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import {
  CUSTOMER_ID_OPTION,
  getGoogleAdsCustomerFromContext,
  getGoogleAdsErrorMessage,
  toMicros,
} from '../helpers/constants';
import { getGoogleAdsAdGroupAllowedValues } from '../helpers/get-ad-group-allowed-values';

const action = 'add_keywords';

const options = {
  ...CUSTOMER_ID_OPTION,
  ad_group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsAdGroupAllowedValues,
    depends_on: ['customer_id'],
  },
  keywords: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          text: {
            type: 'string',
            required: true,
          },
          match_type: {
            type: 'string',
            required: true,
            allowed_values: [
              { value: 'BROAD', display_name: 'Broad' },
              { value: 'PHRASE', display_name: 'Phrase' },
              { value: 'EXACT', display_name: 'Exact' },
            ],
          },
          cpc_bid: {
            type: 'float',
            required: false,
          },
        },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const addKeywords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { ad_group_id, keywords } = obj || {};

    if (!ad_group_id) {
      throw new GoogleAdsError('Ad group ID is required');
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new GoogleAdsError('At least one keyword is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const mutations: MutateOperation<Record<string, unknown>>[] = keywords.map(
        (kw: { text: string; match_type: string; cpc_bid?: number }) => {
          const matchType =
            kw.match_type === 'BROAD'
              ? enums.KeywordMatchType.BROAD
              : kw.match_type === 'PHRASE'
                ? enums.KeywordMatchType.PHRASE
                : enums.KeywordMatchType.EXACT;

          const resource: Record<string, unknown> = {
            ad_group: `customers/${customerId}/adGroups/${ad_group_id}`,
            keyword: {
              text: kw.text,
              match_type: matchType,
            },
            status: enums.AdGroupCriterionStatus.ENABLED,
          };

          if (kw.cpc_bid !== undefined && kw.cpc_bid !== null) {
            resource.cpc_bid_micros = toMicros(kw.cpc_bid);
          }

          return {
            entity: 'ad_group_criterion',
            operation: 'create',
            resource,
          } as MutateOperation<Record<string, unknown>>;
        }
      );

      const response = await customer.mutateResources(mutations);

      return {
        results:
          response.mutate_operation_responses?.map((r) => ({
            resource_name: r.ad_group_criterion_result?.resource_name ?? '',
          })) ?? [],
        keywords_added: keywords.length,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to add keywords: ${message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      results: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              resource_name: { type: 'string' },
            },
          },
        },
      },
      keywords_added: { type: 'integer' },
    },
  },
});

export default addKeywords;
