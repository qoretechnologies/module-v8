// Copyright 2026 Qore Technologies, s.r.o.
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { enums, MutateOperation } from 'google-ads-api';
import { GOOGLE_ADS_APP_NAME, GoogleAdsError } from '../constants';
import { CUSTOMER_ID_OPTION, getGoogleAdsCustomerFromContext, getGoogleAdsErrorMessage } from '../helpers/constants';
import { getGoogleAdsCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';

const action = 'add_negative_keywords';

const options = {
  ...CUSTOMER_ID_OPTION,
  campaign_id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleAdsCampaignAllowedValues,
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
        },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const addNegativeKeywords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_ADS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { customer, customer_id } = getGoogleAdsCustomerFromContext(context as any);

    const { campaign_id, keywords } = obj || {};

    if (!campaign_id) {
      throw new GoogleAdsError('Campaign ID is required');
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new GoogleAdsError('At least one keyword is required');
    }

    const customerId = String(customer_id).replace(/-/g, '');

    try {
      const mutations: MutateOperation<Record<string, unknown>>[] = keywords.map(
        (kw: { text: string; match_type: string }) => {
        const matchType =
          kw.match_type === 'BROAD'
            ? enums.KeywordMatchType.BROAD
            : kw.match_type === 'PHRASE'
              ? enums.KeywordMatchType.PHRASE
              : enums.KeywordMatchType.EXACT;

        return {
          entity: 'campaign_criterion',
          operation: 'create',
          resource: {
            campaign: `customers/${customerId}/campaigns/${campaign_id}`,
            keyword: {
              text: kw.text,
              match_type: matchType,
            },
            negative: true,
          },
        } as MutateOperation<Record<string, unknown>>;
        }
      );

      const response = await customer.mutateResources(mutations);

      return {
        results: response.mutate_operation_responses?.map((r) => ({
          resource_name: r.campaign_criterion_result?.resource_name ?? '',
        })) ?? [],
        keywords_added: keywords.length,
      };
    } catch (error: unknown) {
      const message = getGoogleAdsErrorMessage(error);
      throw new GoogleAdsError(`Failed to add negative keywords: ${message}`);
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

export default addNegativeKeywords;
