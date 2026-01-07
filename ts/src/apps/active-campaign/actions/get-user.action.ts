import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignClient } from '../helpers/constants';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';
import { UserResponseType } from '../response-types';

const action = 'get_user';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveCampaignUserAllowedValues,
  },
} satisfies TQoreOptions;

const getUser = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await activeCampaignClient.get<{ user: Record<string, any> }>(`users/${id}`, {
        token,
        baseUrl: instance_url,
      });

      return response.user;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: UserResponseType,
});

export default getUser;
