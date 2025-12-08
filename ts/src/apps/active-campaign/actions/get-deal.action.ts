import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignDealAllowedValues } from '../helpers/get-deal-id-allowed-values';

const action = 'get_deal';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignDealAllowedValues,
  },
} satisfies TQoreOptions;

const getDeal = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_CAMPAIGN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, instance_url, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'instance_url'],
      optionFields: ['id'],
      ErrorClass: ActiveCampaignError,
    });

    try {
      const response = await activeCampaignApiClient<{
        deal: Record<string, any>;
      }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `deals/${id}`,
      });

      return response.deal;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      owner: { type: 'string' },
      contact: { type: 'string' },
      organization: { type: 'string' },
      group: { type: 'string' },
      stage: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      percent: { type: 'string' },
      cdate: { type: 'string' },
      mdate: { type: 'string' },
      nextdate: { type: 'string' },
      nexttaskid: { type: 'string' },
      value: { type: 'string' },
      currency: { type: 'string' },
      winProbability: { type: 'number' },
      winProbabilityMdate: { type: 'string' },
      status: { type: 'string' },
      activitycount: { type: 'string' },
      nextdealid: { type: 'string' },
      edate: { type: 'string' },
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
      id: { type: 'string' },
      isDisabled: { type: 'bool' },
      account: { type: 'string' },
      customerAccount: { type: 'string' },
    },
  },
});

export default getDeal;
