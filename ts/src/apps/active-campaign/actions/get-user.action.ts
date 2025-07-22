import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_CAMPAIGN_APP_NAME, ActiveCampaignError } from '../constants';
import { activeCampaignApiClient } from '../helpers/constants';
import { getActiveCampaignUserAllowedValues } from '../helpers/get-user-id-allowed-values';

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
      const response = await activeCampaignApiClient<{ user: Record<string, any> }>({
        token,
        url: instance_url,
        method: 'GET',
        path: `users/${id}`,
      });

      return response.user;
    } catch (error) {
      throw new ActiveCampaignError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      username: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      signature: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            lists: { type: 'string' },
            userGroup: { type: 'string' },
            dealGroupTotals: { type: 'string' },
            dealGroupUsers: { type: 'string' },
            configs: { type: 'string' },
          },
        },
      },
      id: { type: 'string' },
    },
  },
});

export default getUser;
