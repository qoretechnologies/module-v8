import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignDealAllowedValues } from '../helpers/get-deal-id-allowed-values';
import { DealResponseType } from '../response-types';

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
      const response = await activeCampaignClient.get<{
        deal: Record<string, any>;
      }>(`deals/${id}`, {
        token,
        baseUrl: instance_url,
      });

      return response.deal;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: DealResponseType,
});

export default getDeal;
