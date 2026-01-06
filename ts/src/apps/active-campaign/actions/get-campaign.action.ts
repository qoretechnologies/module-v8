import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignCampaignAllowedValues } from '../helpers/get-campaign-allowed-values';
import { CampaignResponseType } from '../response-types';

const action = 'get_campaign';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignCampaignAllowedValues,
  },
} satisfies TQoreOptions;

const getCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await activeCampaignClient.get<{ campaign: Record<string, any> }>(`campaigns/${id}`, {
        token,
        baseUrl: instance_url,
      });

      return response.campaign;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: CampaignResponseType,
});

export default getCampaign;
