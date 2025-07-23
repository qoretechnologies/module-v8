import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignAccountAllowedValues } from '../helpers/get-account-id-allowed-values';
import { getActiveCampaignContactAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getActiveCampaignGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getActiveCampaignDealStageAllowedValues } from '../helpers/get-stage-id-allowed-values';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';

const action = 'create_deal';

const options = {
  title: {
    required: true,
    type: 'string',
  },
  account: {
    type: 'string',
    required_groups: ['create_deal'],
    get_allowed_values: getActiveCampaignAccountAllowedValues,
  },
  contact: {
    type: 'string',
    required_groups: ['create_deal'],
    get_allowed_values: getActiveCampaignContactAllowedValues,
  },
  value: {
    type: 'number',
    required: true,
  },
  currency: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'usd', display_name: 'USD' },
      { value: 'eur', display_name: 'EUR' },
      { value: 'gbp', display_name: 'GBP' },
      { value: 'cad', display_name: 'CAD' },
      { value: 'aud', display_name: 'AUD' },
      { value: 'jpy', display_name: 'JPY' },
      { value: 'cny', display_name: 'CNY' },
      { value: 'inr', display_name: 'INR' },
    ],
  },
  stage: {
    type: 'string',
    required_groups: ['create_deal'],
    get_allowed_values: getActiveCampaignDealStageAllowedValues,
  },
  group: {
    type: 'string',
    required_groups: ['deal_stage'],
    get_allowed_values: getActiveCampaignGroupAllowedValues,
  },
  owner: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getActiveCampaignUserAllowedValues,
  },
  percent: {
    type: 'number',
    required: false,
    preselected: true,
  },
  description: {
    type: 'string',
    required: false,
    preselected: true,
  },
  status: {
    type: 'number',
    required: false,
    preselected: true,
    allowed_values: [
      { value: 0, display_name: 'Open' },
      { value: 1, display_name: 'Won' },
      { value: 2, display_name: 'Lost' },
    ],
  },
} satisfies TQoreOptions;

const createContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, title, value, currency } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['title', 'value', 'currency'],
      ErrorClass: ActiveCampaignError,
    });

    const { account, contact, stage, group, owner, percent, description, status } = obj || {};

    try {
      const response = await activeCampaignApiClient<{
        deal: Record<string, any>[];
      }>({
        token,
        url: instance_url,
        method: 'POST',
        path: `deals`,
        body: {
          deal: {
            title,
            value,
            currency,
            ...(account && { account }),
            ...(contact && { contact }),
            ...(stage && { stage }),
            ...(group && { group }),
            ...(owner && { owner }),
            ...(percent && { percent }),
            ...(description && { description }),
            ...(status && { status }),
          },
        },
      });

      return response.deal;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      description: { type: 'string' },
      currency: { type: 'string' },
      percent: { type: 'string' },
      status: { type: 'number' },
      title: { type: 'string' },
      value: { type: 'number' },
      organization: { type: 'number' },
      contact: { type: 'number' },
      group: { type: 'string' },
      owner: { type: 'string' },
      stage: { type: 'string' },
      cdate: { type: 'string' },
      mdate: { type: 'string' },
      nextdate: { type: 'string' },
      hash: { type: 'string' },
      winProbability: { type: 'string' },
      winProbabilityMdate: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            dealActivities: { type: 'string' },
            contact: { type: 'string' },
            contactDeals: { type: 'string' },
            group: { type: 'string' },
            nextTask: { type: 'string' },
            notes: { type: 'string' },
            account: { type: 'string' },
            customerAccount: { type: 'string' },
            organization: { type: 'string' },
            owner: { type: 'string' },
            scoreValues: { type: 'string' },
            stage: { type: 'string' },
            tasks: { type: 'string' },
            dealCustomFieldData: { type: 'string' },
          },
        },
      },
      fields: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              customFieldId: { type: 'number' },
              fieldValue: { type: 'string' },
              dealId: { type: 'string' },
              fieldCurrency: { type: 'string' },
            },
          },
        },
      },
      id: { type: 'string' },
      isDisabled: { type: 'boolean' },
      account: { type: 'number' },
      customerAccount: { type: 'number' },
    },
  },
});

export default createContact;
